// Package go_sdk provides a small bot runtime for the CodeArena BotService.
package go_sdk

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"os"
	"os/signal"
	"syscall"

	pb "github.com/codearena-platform/codearena-core/pkg/api/v1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
)

// BotHandler is implemented by user bots. OnTick is called once per received
// world state and returns the intent to execute on the next tick.
type BotHandler interface {
	OnTick(state *pb.BotState, world *pb.WorldState) *pb.BotIntent
}

// BotKit connects a bot to the engine over the BotService.Connect stream.
type BotKit struct {
	serverAddr string
	botID      string
	handler    BotHandler
	creds      credentials.TransportCredentials
}

// NewBotKit creates a runner for addr. By default an insecure connection is
// used (for local development); use WithTLS or WithTransportCredentials for
// production deployments.
func NewBotKit(addr string, handler BotHandler) *BotKit {
	return &BotKit{
		serverAddr: addr,
		handler:    handler,
		creds:      insecure.NewCredentials(),
	}
}

// WithBotID selects the bot controlled by this runner. It is required when a
// world snapshot contains more than one bot. Passing an ID that does not
// appear in the stream is an error instead of silently controlling a different
// bot.
func (k *BotKit) WithBotID(id string) *BotKit {
	k.botID = id
	return k
}

// WithTLS enables TLS using the supplied config. A nil config uses the system
// roots with TLS 1.2 as the minimum version. The config is cloned so later
// changes by the caller cannot weaken an established configuration.
func (k *BotKit) WithTLS(cfg *tls.Config) *BotKit {
	if cfg == nil {
		cfg = &tls.Config{MinVersion: tls.VersionTLS12}
	}
	k.creds = credentials.NewTLS(cfg.Clone())
	return k
}

// WithTransportCredentials allows callers to supply custom credentials, for
// example credentials.NewTLS(&tls.Config{...}) or a custom certificate source.
func (k *BotKit) WithTransportCredentials(creds credentials.TransportCredentials) *BotKit {
	if creds != nil {
		k.creds = creds
	}
	return k
}

// Run executes the bot loop until the stream ends or the process receives
// SIGINT/SIGTERM. Use RunContext when the caller owns the context.
func (k *BotKit) Run() error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()
	return k.RunContext(ctx)
}

// RunContext executes the bot loop with a caller-provided context. Cancelling
// ctx closes the stream and makes RunContext return ctx.Err().
func (k *BotKit) RunContext(ctx context.Context) error {
	if ctx == nil {
		return errors.New("nil context")
	}
	if k.handler == nil {
		return errors.New("nil bot handler")
	}

	conn, err := grpc.NewClient(k.serverAddr, grpc.WithTransportCredentials(k.creds))
	if err != nil {
		return fmt.Errorf("create gRPC client: %w", err)
	}
	defer conn.Close()

	client := pb.NewBotServiceClient(conn)
	stream, err := client.Connect(ctx)
	if err != nil {
		return fmt.Errorf("open bot stream: %w", err)
	}
	defer func() { _ = stream.CloseSend() }()

	// The server registers the bot on the first received intent.
	if err := stream.Send(&pb.BotIntent{}); err != nil {
		return fmt.Errorf("send handshake: %w", err)
	}

	for {
		world, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			return nil
		}
		if err != nil {
			if ctxErr := ctx.Err(); ctxErr != nil {
				return ctxErr
			}
			return fmt.Errorf("receive world state: %w", err)
		}

		me, err := selectBot(world, k.botID)
		if err != nil {
			return err
		}
		if me == nil {
			// A snapshot without bots carries no tick to act on.
			continue
		}

		if intent := k.handler.OnTick(me, world); intent != nil {
			if err := stream.Send(intent); err != nil {
				if ctxErr := ctx.Err(); ctxErr != nil {
					return ctxErr
				}
				return fmt.Errorf("send intent: %w", err)
			}
		}
	}
}

// selectBot returns the bot controlled by this runner. With an explicit ID it
// performs an exact lookup; otherwise a single-bot snapshot is unambiguous.
// It never guesses the last entry of a multi-bot snapshot.
func selectBot(world *pb.WorldState, botID string) (*pb.BotState, error) {
	if world == nil || len(world.Bots) == 0 {
		return nil, nil
	}

	if botID != "" {
		for _, bot := range world.Bots {
			if bot.GetId() == botID {
				return bot, nil
			}
		}
		return nil, fmt.Errorf("configured bot %q is not in the world snapshot", botID)
	}

	if len(world.Bots) == 1 {
		return world.Bots[0], nil
	}
	return nil, fmt.Errorf("cannot select bot from %d bots: use WithBotID", len(world.Bots))
}

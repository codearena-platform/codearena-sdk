package go_sdk

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/signal"
	"syscall"

	pb "github.com/codearena-platform/codearena-core/pkg/api/v1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type BotHandler interface {
	OnTick(state *pb.BotState, world *pb.WorldState) *pb.BotIntent
}

type BotKit struct {
	serverAddr string
	botID      string
	handler    BotHandler
}

func NewBotKit(addr string, handler BotHandler) *BotKit {
	return &BotKit{serverAddr: addr, handler: handler}
}

// WithBotID selects the bot controlled by this runner. If unset, the last bot
// in the world snapshot is used (legacy behavior for single-bot matches).
func (k *BotKit) WithBotID(id string) *BotKit {
	k.botID = id
	return k
}

func (k *BotKit) Run() error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	conn, err := grpc.NewClient(k.serverAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	defer conn.Close()

	client := pb.NewBotServiceClient(conn)
	stream, err := client.Connect(ctx)
	if err != nil {
		return err
	}

	// Initial handshake.
	if err := stream.Send(&pb.BotIntent{}); err != nil {
		return fmt.Errorf("handshake failed: %w", err)
	}

	for {
		world, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		me := findBot(world, k.botID)
		if me == nil {
			continue
		}

		intent := k.handler.OnTick(me, world)
		if intent != nil {
			if err := stream.Send(intent); err != nil {
				return fmt.Errorf("send intent: %w", err)
			}
		}
	}
}

func findBot(world *pb.WorldState, botID string) *pb.BotState {
	if world == nil || len(world.Bots) == 0 {
		return nil
	}
	if botID != "" {
		for _, bot := range world.Bots {
			if bot.Id == botID {
				return bot
			}
		}
		return nil
	}
	return world.Bots[len(world.Bots)-1]
}

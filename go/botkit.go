package go_sdk

import (
	"context"
	"io"

	pb "github.com/codearena-platform/codearena-core/pkg/types"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type BotHandler interface {
	OnTick(state *pb.BotState, world *pb.WorldState) *pb.BotIntent
}

type BotKit struct {
	serverAddr string
	handler    BotHandler
}

func NewBotKit(addr string, handler BotHandler) *BotKit {
	return &BotKit{serverAddr: addr, handler: handler}
}

func (k *BotKit) Run() error {
	conn, err := grpc.Dial(k.serverAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	defer conn.Close()

	client := pb.NewBotServiceClient(conn)
	stream, err := client.Connect(context.Background())
	if err != nil {
		return err
	}

	// Initial handshake
	stream.Send(&pb.BotIntent{})

	for {
		state, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		// Helper to find "me"
		// In a real SDK we would handle ID registration more robustly
		var me *pb.BotState
		if len(state.Bots) > 0 {
			me = state.Bots[len(state.Bots)-1] // Placeholder logic
		}

		if me != nil {
			intent := k.handler.OnTick(me, state)
			if intent != nil {
				stream.Send(intent)
			}
		}
	}
}

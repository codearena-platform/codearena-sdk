package go_sdk

import (
	"context"
	"errors"
	"net"
	"testing"
	"time"

	pb "github.com/codearena-platform/codearena-core/pkg/api/v1"
	"google.golang.org/grpc"
)

func TestSelectBot(t *testing.T) {
	tests := []struct {
		name    string
		world   *pb.WorldState
		botID   string
		wantID  string
		wantErr bool
	}{
		{name: "explicit id", world: &pb.WorldState{Bots: []*pb.BotState{{Id: "alpha"}, {Id: "beta"}}}, botID: "beta", wantID: "beta"},
		{name: "unknown id", world: &pb.WorldState{Bots: []*pb.BotState{{Id: "alpha"}}}, botID: "missing", wantErr: true},
		{name: "single bot", world: &pb.WorldState{Bots: []*pb.BotState{{Id: "solo"}}}, wantID: "solo"},
		{name: "ambiguous", world: &pb.WorldState{Bots: []*pb.BotState{{Id: "alpha"}, {Id: "beta"}}}, wantErr: true},
		{name: "empty world", world: &pb.WorldState{}, wantID: ""},
		{name: "nil world", wantID: ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := selectBot(tt.world, tt.botID)
			if (err != nil) != tt.wantErr {
				t.Fatalf("selectBot() error = %v, wantErr %t", err, tt.wantErr)
			}
			if tt.wantID == "" && got == nil {
				return
			}
			if got == nil || got.GetId() != tt.wantID {
				t.Fatalf("selectBot() = %v, want id %q", got, tt.wantID)
			}
		})
	}
}

func TestRunContextRejectsInvalidSetup(t *testing.T) {
	if err := NewBotKit("unused", nil).RunContext(context.Background()); err == nil {
		t.Fatal("expected an error for a nil handler")
	}
	if err := NewBotKit("unused", &recordingBot{}).RunContext(nil); err == nil {
		t.Fatal("expected an error for a nil context")
	}
}

type recordingBot struct {
	ticks   chan int64
	handler func(*pb.BotState, *pb.WorldState) *pb.BotIntent
}

func (b *recordingBot) OnTick(me *pb.BotState, world *pb.WorldState) *pb.BotIntent {
	if b.ticks != nil {
		b.ticks <- world.GetTick()
	}
	if b.handler != nil {
		return b.handler(me, world)
	}
	return &pb.BotIntent{MoveDistance: 5, FirePower: 1.5}
}

type fakeBotService struct {
	pb.UnimplementedBotServiceServer
	handshakes chan struct{}
	intents    chan *pb.BotIntent
}

func (s *fakeBotService) Connect(stream pb.BotService_ConnectServer) error {
	if _, err := stream.Recv(); err != nil {
		return err
	}
	close(s.handshakes)

	if err := stream.Send(&pb.WorldState{
		Tick: 7,
		Bots: []*pb.BotState{{Id: "bot-42", Energy: 100}},
	}); err != nil {
		return err
	}

	intent, err := stream.Recv()
	if err != nil {
		return err
	}
	s.intents <- intent

	<-stream.Context().Done()
	return stream.Context().Err()
}

func TestRunContextStreamsIntentAndHonorsCancellation(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	service := &fakeBotService{
		handshakes: make(chan struct{}),
		intents:    make(chan *pb.BotIntent, 1),
	}
	server := grpc.NewServer()
	pb.RegisterBotServiceServer(server, service)
	go func() { _ = server.Serve(listener) }()
	t.Cleanup(func() {
		server.Stop()
		_ = listener.Close()
	})

	bot := &recordingBot{ticks: make(chan int64, 1)}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	done := make(chan error, 1)
	go func() {
		done <- NewBotKit(listener.Addr().String(), bot).WithBotID("bot-42").RunContext(ctx)
	}()

	wait := func(ch <-chan struct{}, what string) {
		t.Helper()
		select {
		case <-ch:
		case <-time.After(5 * time.Second):
			t.Fatalf("timed out waiting for %s", what)
		}
	}
	wait(service.handshakes, "handshake")

	select {
	case tick := <-bot.ticks:
		if tick != 7 {
			t.Fatalf("handler tick = %d, want 7", tick)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("timed out waiting for bot tick")
	}

	select {
	case intent := <-service.intents:
		if intent.GetMoveDistance() != 5 || intent.GetFirePower() != 1.5 {
			t.Fatalf("received intent = %v", intent)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("timed out waiting for intent")
	}

	cancel()
	select {
	case err := <-done:
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("RunContext() error = %v, want context.Canceled", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("RunContext did not return after cancellation")
	}
}

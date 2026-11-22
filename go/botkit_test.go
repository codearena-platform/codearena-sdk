package go_sdk

import (
	"testing"

	pb "github.com/codearena-platform/codearena-core/pkg/api/v1"
)

func TestFindBot(t *testing.T) {
	world := &pb.WorldState{Bots: []*pb.BotState{{Id: "alpha"}, {Id: "beta"}}}

	if got := findBot(world, "alpha"); got == nil || got.Id != "alpha" {
		t.Fatalf("findBot with id = %v, want alpha", got)
	}
	if got := findBot(world, "missing"); got != nil {
		t.Fatalf("findBot with unknown id = %v, want nil", got)
	}
	if got := findBot(world, ""); got == nil || got.Id != "beta" {
		t.Fatalf("legacy findBot = %v, want beta", got)
	}
	if got := findBot(nil, "alpha"); got != nil {
		t.Fatalf("findBot(nil) = %v, want nil", got)
	}
}

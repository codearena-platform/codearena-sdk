package go_sdk

import (
	"encoding/hex"
	"os"
	"path/filepath"
	"strings"
	"testing"

	pb "github.com/codearena-platform/codearena-core/pkg/api/v1"
	"google.golang.org/protobuf/proto"
)

func goldenBytes(t *testing.T, name string) []byte {
	t.Helper()
	path := filepath.Join("..", "contract", "fixtures", name)
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	decoded, err := hex.DecodeString(strings.TrimSpace(string(data)))
	if err != nil {
		t.Fatalf("invalid hex fixture %s: %v", path, err)
	}
	return decoded
}

func TestGoldenBotIntentEncoding(t *testing.T) {
	data := goldenBytes(t, "bot_intent.hex")
	intent := &pb.BotIntent{}
	if err := proto.Unmarshal(data, intent); err != nil {
		t.Fatal(err)
	}
	if intent.GetMoveDistance() != 12.5 || intent.GetTurnDegrees() != -30 ||
		intent.GetGunTurnDegrees() != 15 || intent.GetRadarTurnDegrees() != 90 ||
		intent.GetFirePower() != 2.5 || intent.GetUsePower() != pb.PowerType_SHIELD {
		t.Fatalf("unexpected intent: %v", intent)
	}
	encoded, err := (proto.MarshalOptions{Deterministic: true}).Marshal(intent)
	if err != nil {
		t.Fatal(err)
	}
	if hex.EncodeToString(encoded) != hex.EncodeToString(data) {
		t.Fatalf("re-encoded intent = %x, want %x", encoded, data)
	}
}

func TestGoldenWorldStateEncoding(t *testing.T) {
	data := goldenBytes(t, "world_state.hex")
	world := &pb.WorldState{}
	if err := proto.Unmarshal(data, world); err != nil {
		t.Fatal(err)
	}
	if world.GetTick() != 42 || world.GetStatus() != pb.MatchStatus_RUNNING {
		t.Fatalf("unexpected world header: %v", world)
	}
	if len(world.GetBots()) != 1 {
		t.Fatalf("bots = %d, want 1", len(world.GetBots()))
	}
	bot := world.GetBots()[0]
	if bot.GetId() != "bot-1" || bot.GetPosition().GetX() != 1.5 ||
		bot.GetCooldowns()["SHIELD"] != 3 || bot.GetClass() != "Tank" {
		t.Fatalf("unexpected bot: %v", bot)
	}
	if world.GetZone().GetRadius() != 400 || len(world.GetEvents()) != 1 {
		t.Fatalf("unexpected zone/events: %v", world)
	}
	event := world.GetEvents()[0].GetHitRobot()
	if event == nil || event.GetOtherId() != "bot-2" {
		t.Fatalf("unexpected event: %v", world.GetEvents()[0])
	}
	encoded, err := (proto.MarshalOptions{Deterministic: true}).Marshal(world)
	if err != nil {
		t.Fatal(err)
	}
	if hex.EncodeToString(encoded) != hex.EncodeToString(data) {
		t.Fatalf("re-encoded world = %x, want %x", encoded, data)
	}
}

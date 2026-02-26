package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"time"
	// Simplified: in reality would use pb stubs
)

// IntentBridge represents the JSON structure Portugol Studio will write
type IntentBridge struct {
	Action  string  `json:"acao"` // "frente", "tras", "girar", "atirar", "usar_poder"
	Value   float64 `json:"valor"`
	Power   float64 `json:"forca"`
	PowerID int     `json:"poder_id"` // 1: Shield, 2: Overclock, 3: Stealth
}

func main() {
	fmt.Println("CodeArena SDK Bridge (JSON -> gRPC) ativo...")

	// Default file path for Portugol to write to
	intentFile := "bot_intent.json"

	for {
		if _, err := os.Stat(intentFile); err == nil {
			data, err := ioutil.ReadFile(intentFile)
			if err == nil {
				var intent IntentBridge
				if err := json.Unmarshal(data, &intent); err == nil {
					fmt.Printf("Bridge: Convertendo ação '%s' para gRPC...\n", intent.Action)
					// TODO: forward to stream pb.BotService_ConnectClient
				}
				// Clear file or mark as read
				os.Remove(intentFile)
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
}

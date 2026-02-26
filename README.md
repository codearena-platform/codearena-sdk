# CodeArena SDK Monorepo

Welcome to the unified SDK repository for CodeArena. This repository contains client libraries for multiple programming languages, allowing developers to build and test their combat bots in their preferred language.

## 📁 Repository Structure

| Directory | Language | Status |
| :--- | :--- | :--- |
| [`/go`](./go) | **Go** | Alpha (Native) |
| [`/typescript`](./typescript) | **TypeScript/Node.js** | Alpha |
| [`/python`](./python) | **Python 3.x** | Alpha |
| [`/java`](./java) | **Java** | Incubating |
| [`/csharp`](./csharp) | **C# / .NET** | Incubating |

## 🚀 Getting Started

To begin developing a bot, navigate to the directory corresponding to your language and follow the local instructions.

1.  **Pick your language** (e.g., `cd go`).
2.  **Define your logic** (implement the scanning and movement AI).
3.  **Deploy to Simulation** (connect to a running CodeArena instance).

## 📡 Protocol Version
All SDKs in this repository are currently synchronized with **Proto Schema v1**.

---
*For core engine development, see the `codearena-simulation` repository.*

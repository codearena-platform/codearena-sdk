#!/usr/bin/env python3
"""Regenerate the Python gRPC stubs from the vendored bot_api.proto.

Usage (from anywhere):

    python scripts/generate_stubs.py
    python scripts/generate_stubs.py --from-core ../../codearena-core/api/proto/v1/bot_api.proto
    python scripts/generate_stubs.py --from-core ... --check

``--check`` exits non-zero when regeneration would change a committed file.
The vendored proto is a verbatim copy of the core proto and is packaged so
installed SDKs do not need a sibling core checkout.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

PYTHON_ROOT = Path(__file__).resolve().parents[1]
PROTO = PYTHON_ROOT / "codearena_sdk" / "generated" / "v1" / "bot_api.proto"
OUTPUTS = (
    PYTHON_ROOT / "codearena_sdk" / "generated" / "v1" / "bot_api_pb2.py",
    PYTHON_ROOT / "codearena_sdk" / "generated" / "v1" / "bot_api_pb2_grpc.py",
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--from-core",
        type=Path,
        help="copy this core bot_api.proto into the package before generating",
    )
    parser.add_argument("--check", action="store_true", help="verify generated files are current")
    args = parser.parse_args()

    if args.from_core:
        source = args.from_core.resolve()
        if not source.is_file():
            parser.error(f"core proto not found: {source}")
        PROTO.write_bytes(source.read_bytes())

    try:
        import grpc_tools.protoc  # noqa: F401
    except ImportError:
        parser.error("grpcio-tools is required: pip install -e '.[dev]'")

    before = {path: path.read_bytes() for path in (PROTO, *OUTPUTS) if path.exists()}
    subprocess.run(
        [
            sys.executable,
            "-m",
            "grpc_tools.protoc",
            "-I",
            ".",
            f"--python_out={PYTHON_ROOT}",
            f"--grpc_python_out={PYTHON_ROOT}",
            str(PROTO.relative_to(PYTHON_ROOT)),
        ],
        check=True,
        cwd=PYTHON_ROOT,
    )

    changed = [
        str(path.relative_to(PYTHON_ROOT))
        for path, data in before.items()
        if not path.exists() or path.read_bytes() != data
    ]
    if args.check and changed:
        print("stale generated files: " + ", ".join(changed), file=sys.stderr)
        return 1
    if changed:
        print("updated: " + ", ".join(changed))
    else:
        print("generated stubs are up to date")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

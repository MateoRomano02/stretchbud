PREFIX ?= $(HOME)/.local
APP_SUPPORT := $(HOME)/Library/Application Support/Stretchbud
CORE := $(wildcard Sources/Core/*.swift)
APP := $(wildcard Sources/App/*.swift)
SWIFTC := swiftc -O

.PHONY: all test app run install uninstall clean claude-hooks claude-hooks-remove

all: app

build:
	mkdir -p build

test: build
	$(SWIFTC) $(CORE) Tests/main.swift -o build/tests
	./build/tests

app: build
	$(SWIFTC) $(CORE) $(APP) -o build/stretchbud

run: app
	STRETCHBUD_WEB="$(CURDIR)/web" ./build/stretchbud

install: app
	./scripts/install.sh "$(PREFIX)"

uninstall:
	./scripts/uninstall.sh "$(PREFIX)"

claude-hooks:
	python3 scripts/claude_hooks.py install "$(PREFIX)/bin/stretchbud-hook"

claude-hooks-remove:
	python3 scripts/claude_hooks.py remove

clean:
	rm -rf build

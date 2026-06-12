.PHONY: install lint lint-fix format format-check check clean
.DEFAULT_GOAL := check

install:
	uv sync --group dev

lint:
	uv run ruff check src/

lint-fix:
	uv run ruff check --fix src/

format:
	uv run ruff format src/
	uv run black src/

format-check:
	uv run ruff format --check src/
	uv run black --check src/

check: lint format-check

clean:
	rm -rf __pycache__ .ruff_cache .pytest_cache
	find . -type d -name __pycache__ -exec rm -rf {} +

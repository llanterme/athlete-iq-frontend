.PHONY: install dev build start lint type-check clean setup

# Install dependencies
install:
	npm install

# Run development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Start production server
start:
	npm run start

# Run linting
lint:
	npm run lint

# Run type checking
type-check:
	npm run type-check

# Clean node_modules and build files
clean:
	rm -rf node_modules .next
	rm -rf package-lock.json

# Setup development environment
setup: install
	@echo "Frontend setup complete!"
	@echo "Run 'make dev' to start the development server"

# Show help
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make build      - Build for production"
	@echo "  make start      - Start production server"
	@echo "  make lint       - Run linting"
	@echo "  make type-check - Run type checking"
	@echo "  make clean      - Clean dependencies and build files"
	@echo "  make setup      - Setup development environment"
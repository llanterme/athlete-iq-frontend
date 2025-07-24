.PHONY: install dev build start lint type-check clean setup help test

# Default target
.DEFAULT_GOAL := help

# Install dependencies
install:
	npm install

# Run development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Start production server (local)
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
	rm -rf .env.production

# Full rebuild
rebuild: clean install build

# Setup development environment
setup: install
	@echo "✅ Frontend setup complete!"
	@echo "📝 Make sure to create .env.local with required variables:"
	@echo "   - NEXTAUTH_URL"
	@echo "   - NEXTAUTH_SECRET"
	@echo "   - STRAVA_CLIENT_ID"
	@echo "   - STRAVA_CLIENT_SECRET"
	@echo "   - NEXT_PUBLIC_API_URL"
	@echo ""
	@echo "🚀 Run 'make dev' to start the development server"

# Check environment variables
check-env:
	@echo "Checking environment variables..."
	@test -f .env.local || (echo "❌ .env.local not found" && exit 1)
	@grep -q "NEXTAUTH_URL" .env.local || echo "⚠️  NEXTAUTH_URL not set"
	@grep -q "NEXTAUTH_SECRET" .env.local || echo "⚠️  NEXTAUTH_SECRET not set"
	@grep -q "STRAVA_CLIENT_ID" .env.local || echo "⚠️  STRAVA_CLIENT_ID not set"
	@grep -q "STRAVA_CLIENT_SECRET" .env.local || echo "⚠️  STRAVA_CLIENT_SECRET not set"
	@grep -q "NEXT_PUBLIC_API_URL" .env.local || echo "⚠️  NEXT_PUBLIC_API_URL not set"
	@echo "✅ Environment check complete"

# Run pre-deployment checks
pre-deploy: lint type-check check-env
	@echo "✅ Pre-deployment checks passed"

# Show help
help:
	@echo "🏃 Athlete IQ Frontend - Available commands:"
	@echo ""
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make start        - Start production server locally"
	@echo "  make lint         - Run linting"
	@echo "  make type-check   - Run TypeScript type checking"
	@echo "  make clean        - Clean dependencies and build files"
	@echo "  make rebuild      - Clean and rebuild everything"
	@echo "  make setup        - Initial setup for development"
	@echo "  make check-env    - Verify environment variables"
	@echo "  make pre-deploy   - Run all checks before deployment"
	@echo "  make help         - Show this help message"
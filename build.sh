#!/bin/bash

# Install all dependencies using the monorepo root
npm install

# Build the frontend (Vite)
npm run build --workspace=frontend

# The backend doesn't usually need a "build" step in Node.js, 
# but we ensure dependencies are ready.

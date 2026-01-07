#!/bin/bash

# Run a static web server in the current working directory
# and also run a livereload server that watches CWD

# Function to stop both processes
cleanup() {
  echo "Stopping processes $PID1 and $PID2"
  kill "$PID1" "$PID2"
  wait "$PID1"
  wait "$PID2"
}

# Set up a trap to catch signals and run the cleanup function
trap cleanup SIGINT SIGTERM

# Start the first process and capture the PID
livereload &
PID1=$!

# Start the second process and capture the PID
http-server &
PID2=$!

echo "Started processes with PIDs $PID1 and $PID2"

# Wait for both processes to finish
wait $PID1
wait $PID2

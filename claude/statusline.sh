#!/bin/bash

# Read the JSON input
input=$(cat)

# Extract values from JSON
current_dir=$(echo "$input" | jq -r '.workspace.current_dir')
model_name=$(echo "$input" | jq -r '.model.display_name')
output_style=$(echo "$input" | jq -r '.output_style.name')
context_size=$(echo "$input" | jq -r '.context_window.context_window_size')
usage=$(echo "$input" | jq '.context_window.current_usage')

# Get current directory name (with ~ for home)
dir_display=$(echo "$current_dir" | sed "s|^$HOME|~|")

# Get git branch and status
git_info=""
if git -C "$current_dir" rev-parse --git-dir > /dev/null 2>&1; then
    branch=$(git -C "$current_dir" branch --show-current 2>/dev/null)
    if [ -z "$branch" ]; then
        branch=$(git -C "$current_dir" describe --tags --exact-match 2>/dev/null | head -n1)
        if [ -z "$branch" ]; then
            branch=$(git -C "$current_dir" rev-parse --short HEAD 2>/dev/null)
        fi
    fi
    
    if [ -n "$branch" ]; then
        # Check if repo is dirty
        if ! git -C "$current_dir" diff --quiet 2>/dev/null || ! git -C "$current_dir" diff --cached --quiet 2>/dev/null || [ -n "$(git -C "$current_dir" ls-files --others --exclude-standard)" ]; then
            git_info=" ${branch} ±"
        else
            git_info=" ${branch}"
        fi
    fi
fi

# Calculate current context from current_usage fields
percent_usage=0
if [ "$usage" != "null" ]; then
    current_tokens=$(echo "$usage" | jq '.input_tokens + .cache_creation_input_tokens + .cache_read_input_tokens')
    percent_usage=$((current_tokens * 100 / context_size))
fi

# Build the status line
# Show directory in blue, git info in green/yellow based on status, and model info
if [ -n "$git_info" ]; then
    printf "\033[34m%s\033[0m \033[33m%s\033[0m \033[90m│ %s Context: %s\033[0m" "$dir_display" "$git_info" "$model_name" "$percent_usage%"
else
    printf "\033[34m%s\033[0m \033[90m│ %s Context: %s\033[0m" "$dir_display" "$model_name" "$percent_usage%"
fi

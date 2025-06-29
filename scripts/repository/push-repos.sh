#!/bin/bash

echo "🚀 Pushing ReelApps Split Repositories to GitHub"
echo "================================================"

# Change to the split-repos directory
cd ../split-repos

# Function to push a repository
push_repo() {
    local repo_dir=$1
    local repo_name=$2
    
    echo "📤 Pushing $repo_name..."
    cd $repo_dir
    
    # Push to GitHub
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ $repo_name pushed successfully!"
    else
        echo "❌ Failed to push $repo_name"
    fi
    
    cd ..
    echo ""
}

# Push each repository
push_repo "ReelCV" "ReelCV"
push_repo "ReelHunter" "ReelHunter"
push_repo "ReelPersona" "ReelPersona"
push_repo "ReelSkills" "ReelSkills"
push_repo "ReelProjects" "ReelProjects"

echo "🎉 All repositories have been pushed to GitHub!"
echo ""
echo "Your repositories are now available at:"
echo "- https://github.com/NathiDhliso/ReelCV"
echo "- https://github.com/NathiDhliso/ReelHunter"
echo "- https://github.com/NathiDhliso/ReelPersona"
echo "- https://github.com/NathiDhliso/ReelSkills"
echo "- https://github.com/NathiDhliso/ReelProjects"
echo ""
echo "Next: Set up shared packages in the main ReelApps repo" 
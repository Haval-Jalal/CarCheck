#!/bin/bash
# Usage: ./create-issue.sh "title" "body" "status_opt" "priority_opt" "type_opt" "sprint_opt" "area_opt"
# Creates issue, adds to project, sets all fields

PROJ_ID="PVT_kwHODIg7Z84BPCz1"
STATUS_FIELD="PVTSSF_lAHODIg7Z84BPCz1zg9kZ-o"
PRIORITY_FIELD="PVTSSF_lAHODIg7Z84BPCz1zg9kaWU"
TYPE_FIELD="PVTSSF_lAHODIg7Z84BPCz1zg9kaXo"
SPRINT_FIELD="PVTSSF_lAHODIg7Z84BPCz1zg9kaZo"
AREA_FIELD="PVTSSF_lAHODIg7Z84BPCz1zg9kacM"

TITLE="$1"
BODY="$2"
STATUS_OPT="$3"
PRIORITY_OPT="$4"
TYPE_OPT="$5"
SPRINT_OPT="$6"
AREA_OPT="$7"

# Create issue
ISSUE_URL=$(gh issue create --repo Haval-Jalal/CarCheck --title "$TITLE" --body "$BODY" 2>&1)
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oP '\d+$')
echo "Created issue #$ISSUE_NUM: $TITLE"

# Get issue node ID
ISSUE_NODE_ID=$(gh api graphql -f query="query { repository(owner:\"Haval-Jalal\", name:\"CarCheck\") { issue(number:$ISSUE_NUM) { id } } }" --jq '.data.repository.issue.id' 2>&1)

# Add to project
ITEM_ID=$(gh api graphql -f query="mutation { addProjectV2ItemById(input: {projectId:\"$PROJ_ID\", contentId:\"$ISSUE_NODE_ID\"}) { item { id } } }" --jq '.data.addProjectV2ItemById.item.id' 2>&1)

# Set fields
gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: {projectId:\"$PROJ_ID\", itemId:\"$ITEM_ID\", fieldId:\"$STATUS_FIELD\", value:{singleSelectOptionId:\"$STATUS_OPT\"}}) { projectV2Item { id } } }" > /dev/null 2>&1
gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: {projectId:\"$PROJ_ID\", itemId:\"$ITEM_ID\", fieldId:\"$PRIORITY_FIELD\", value:{singleSelectOptionId:\"$PRIORITY_OPT\"}}) { projectV2Item { id } } }" > /dev/null 2>&1
gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: {projectId:\"$PROJ_ID\", itemId:\"$ITEM_ID\", fieldId:\"$TYPE_FIELD\", value:{singleSelectOptionId:\"$TYPE_OPT\"}}) { projectV2Item { id } } }" > /dev/null 2>&1
gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: {projectId:\"$PROJ_ID\", itemId:\"$ITEM_ID\", fieldId:\"$SPRINT_FIELD\", value:{singleSelectOptionId:\"$SPRINT_OPT\"}}) { projectV2Item { id } } }" > /dev/null 2>&1
gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: {projectId:\"$PROJ_ID\", itemId:\"$ITEM_ID\", fieldId:\"$AREA_FIELD\", value:{singleSelectOptionId:\"$AREA_OPT\"}}) { projectV2Item { id } } }" > /dev/null 2>&1

echo "$ISSUE_NUM"

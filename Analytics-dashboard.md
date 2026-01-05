
## Context
I need to build a mock analytics dashboard for a demo. This is for a partner management platform where Google Partner Development Managers (PDMs) assign sales opportunities to partners. The audience is a manager who oversees multiple PDMs and needs executive-level visibility into partner program performance.

## Page Structure

Create a single-page analytics dashboard with the following sections:

### 1. Top Navigation Bar
- Logo/app name: "Partner Intelligence Platform"
- Active tab: "Analytics" (with tabs for Campaigns, Partners, Analytics, Settings)
- User profile dropdown: "manager@google.com"

### 2. Page Header
- Title: "Analytics Dashboard"
- Subtitle: "Last updated: Today at 2:43 PM PST"
- Controls row:
  - Date range dropdown (default: "Last 30 Days")
  - Workload filter dropdown (default: "All Workloads")
  - "Export Report" button

### 3. Section: Program Overview KPIs (4 cards in grid)

Create 4 KPI cards with the following data:

**Card 1: Total Opportunities Assigned**
- Large number: 1,847
- Trend indicator: ↑ 23% vs. last period (green)
- Sparkline chart showing 30-day growth trend

**Card 2: Active Pipeline**
- Large number: $28.4M
- Subtitle: 287 opportunities in pipeline
- Trend indicator: ↑ 31% vs. last period (green)
- Progress bar: 15.5% of total assigned

**Card 3: Converted to SS2**
- Large number: 42
- Subtitle: 2.3% conversion rate
- Trend indicator: ↑ 12% vs. last period (green)
- Warning indicator: "Target: 3.0%" with warning icon

**Card 4: Partner Engagement Rate**
- Large number: 64%
- Subtitle: 1,182 of 1,847 opportunities
- Trend indicator: ↑ 8% vs. last period (green)

### 4. Section: Campaign Performance Table

Create a sortable table with these columns:
- Campaign Name (clickable - opens modal)
- Workload (Gemini, GCP, Security, Workspace, Looker)
- Assigned (number)
- Engaged (number and percentage)
- Pipeline (number and percentage)
- SS2 (number)
- Pipeline $ (formatted currency)
- Conv. Rate (percentage with checkmark if >2.5%)
- PDM (name)

**Sample data** (7 rows):
1. Gemini Enterprise Q1 | Gemini | 247 | 89 (36%) | 23 (9%) | 3 | $4.2M | 1.2% | Sarah
2. GCP Migration Wave | GCP | 412 | 283 (69%) | 67 (16%) | 12 | $12.3M | 2.9% ✓ | James
3. Security Compliance | Security | 189 | 124 (66%) | 31 (16%) | 8 | $6.8M | 4.2% ✓ | Maria
4. Workspace Expansion | Workspace | 334 | 187 (56%) | 42 (13%) | 9 | $3.1M | 2.7% ✓ | David
5. Looker Analytics Push | Looker | 156 | 71 (46%) | 18 (12%) | 2 | $2.0M | 1.3% | Sarah
6. Gemini for Developers | Gemini | 298 | 234 (79%) | 48 (16%) | 6 | $5.6M | 2.0% | Alex
7. GCP Startup Program | GCP | 211 | 194 (92%) | 58 (27%) | 2 | $1.8M | 0.9% | Chris

**Features**:
- Sortable by any column
- Hover tooltips showing details
- Green checkmark (✓) for conversion rates >2.5%

### 5. Section: Partner Performance Leaderboard

Create a table with these columns:
- Rank (1-10)
- Partner Name (clickable - opens modal)
- Tier (Strategic, Disti, Service)
- Type (Managed, Unmanaged)
- Assigned (number)
- Engaged (number and percentage)
- Pipeline (number and percentage)
- SS2 (number)
- Conv. Rate (percentage with ⭐ if >4%)
- Health (color indicator: 🟢 green, 🟡 yellow, 🔴 red)

**Sample data** (10 rows):
1. CloudTech Solutions | Strategic | Managed | 234 | 187 (80%) | 89 (38%) | 18 | 7.7% ⭐ | 🟢
2. Enterprise Partners | Strategic | Managed | 298 | 234 (79%) | 67 (22%) | 12 | 4.0% ⭐ | 🟢
3. Global Systems Inc | Strategic | Managed | 187 | 143 (76%) | 48 (26%) | 8 | 4.3% ⭐ | 🟢
4. TechForward Group | Disti | Unmanaged | 156 | 118 (76%) | 31 (20%) | 4 | 2.6% | 🟢
5. Digital Transform Co | Strategic | Managed | 143 | 97 (68%) | 23 (16%) | 3 | 2.1% | 🟡
6. Innovation Partners | Service | Managed | 201 | 134 (67%) | 28 (14%) | 2 | 1.0% | 🟡
7. NextGen Solutions | Strategic | Managed | 189 | 124 (66%) | 18 (10%) | 1 | 0.5% | 🟡
8. Apex Technology | Disti | Unmanaged | 127 | 71 (56%) | 12 (9%) | 1 | 0.8% | 🟡
9. Premier Partners LLC | Strategic | Managed | 112 | 58 (52%) | 8 (7%) | 0 | 0.0% | 🔴
10. Strategic Alliance Co | Service | Managed | 98 | 31 (32%) | 4 (4%) | 0 | 0.0% | 🔴

**Features**:
- Sortable
- Hover tooltips for health indicator explaining criteria
- Color-coded health status

### 6. Section: Pipeline by Workload (Horizontal Bar Chart)

Create a horizontal bar chart showing 5 workloads:
- Gemini Enterprise: 545 assigned → 157 pipeline → $9.8M (29% conversion)
- GCP: 623 assigned → 125 pipeline → $14.1M (20% conversion)
- Security: 189 assigned → 31 pipeline → $6.8M (16% conversion)
- Workspace: 334 assigned → 42 pipeline → $3.1M (13% conversion)
- Looker: 156 assigned → 18 pipeline → $2.0M (12% conversion)

**Below chart, add "Key Insights" section:**
- "GCP has highest pipeline value ($14.1M) but lower conversion rate (20%) - high volume play"
- "Gemini has best engagement-to-pipeline rate (29%) - quality over quantity"
- "Security has highest average deal size ($219k per opportunity in pipeline)"
- "Workspace and Looker may be under-resourced compared to opportunity quality"

### 7. Section: PDM Activity Summary Table

Create table with columns:
- PDM Name
- Active Campaigns
- Opps Assigned
- Partners Managed
- Avg Response Time

**Sample data** (6 rows):
1. Sarah Chen | 3 | 545 | 8 | 4.2 hours
2. James Park | 2 | 412 | 6 | 2.8 hours
3. Maria Lopez | 2 | 189 | 4 | 3.1 hours
4. David Kim | 1 | 334 | 5 | 5.7 hours
5. Alex Rivera | 1 | 298 | 4 | 3.9 hours
6. Chris Taylor | 1 | 211 | 3 | 6.2 hours

## Modal: Campaign Detail View

When user clicks a campaign name, open a modal with:

**Header**: 
- Campaign name: "Gemini Enterprise Q1 2025 Push"
- Metadata: Created date, PDM name, Status
- Close button

**Content sections**:

1. **Campaign Summary** (card):
   - Target criteria text
   - Routing logic rules (3 bullet points)

2. **Performance Metrics** (4 small cards):
   - Assigned: 247
   - Engaged: 89 (36%)
   - Pipeline: 23 (9%)
   - Converted: 3 (1.2%)

3. **Partner Breakdown Table**:
   - CloudTech Solutions | 127 | 71 (56%) | 18 (14%) | 2 | 1.6%
   - Enterprise Partners | 60 | 22 (37%) | 4 (7%) | 0 | 0.0% ⚠️
   - Global Systems Inc | 60 | 31 (52%) | 9 (15%) | 1 | 1.7%
   - Innovation Partners | 31 | 8 (26%) | 2 (6%) | 0 | 0.0% ⚠️

4. **Activity Timeline**:
   - 5 recent activity items with dates
   - "View Full Activity Log" link

5. **Action Buttons** (bottom):
   - Edit Campaign
   - Add Partners
   - Export Report

## Modal: Partner Detail View

When user clicks partner name, open modal with:

**Header**:
- Partner name: "CloudTech Solutions"
- Metadata: Tier, Type, "Partner since" date
- Health indicator
- Close button

**Content sections**:

1. **Partner Overview** (2-column layout):
   - Left: Contact information (name, title, email, phone, territory)
   - Right: Certifications checklist, preferred verticals list

2. **Performance Metrics** (5 small cards):
   - Assigned: 234
   - Engaged: 187 (80%)
   - Pipeline: 89 (38%)
   - SS2: 18 (7.7%)
   - Avg Deal Size: $245K

3. **Campaign Participation Table**:
   - 4 campaigns they're involved in with performance indicators

4. **Performance Trend** (line chart):
   - 30-day chart showing opportunities in pipeline over time
   - Upward trend line

5. **Notes & Activity** (2-column):
   - Left: PDM notes (3 recent notes with dates)
   - Right: Recent activity (3 items)

6. **Action Buttons** (bottom):
   - Assign More Opportunities
   - Send Message
   - Schedule Review

## Design Specifications

**Colors** (Google brand colors):
- Primary: #4285F4 (Google blue)
- Success: #34A853 (green)
- Warning: #FBBC04 (yellow)
- Error: #EA4335 (red)
- Neutral: #5F6368 (gray)

**Typography**:
- Use system font stack or Google Sans/Roboto
- Headers: 24px bold
- Subheaders: 18px medium
- Body: 14px regular
- Numbers/metrics: 16-20px for emphasis

**Layout**:
- Max width: 1400px, centered
- Cards with subtle shadows and rounded corners
- 16px spacing between sections
- 8px padding inside cards

**Charts**:
- Use Recharts components
- Minimal axes, clear labels
- Tooltips on hover
- Consistent color scheme

## Interactions

**Required functionality**:
1. Table sorting (click column headers)
2. Modal open/close animations (smooth fade-in)
3. Hover tooltips on metrics
4. Dropdown filters (functional but don't need to actually filter data for demo)
5. Responsive layout (works on desktop and tablet)

**Nice to have**:
- Sparkline animations on KPI cards
- Smooth transitions when sorting tables
- Copy-to-clipboard for export functionality
- Toast notifications for actions

## Mock Data Generation

Create realistic mock data with these patterns:
- **Pareto principle**: Top 20% partners drive 80% results
- **Conversion funnel**: Natural drop-off (Assigned > Engaged > Pipeline > SS2)
- **Performance spread**: Mix of high, medium, low performers
- **Realistic percentages**: 
  - Engagement: 30-90%
  - Pipeline: 10-40% of engaged
  - Conversion: 0-8% of assigned

## File Structure

Organize as:
```
/src
  /components
    /analytics
      AnalyticsDashboard.tsx (main component)
      KPICard.tsx
      CampaignTable.tsx
      PartnerTable.tsx
      WorkloadChart.tsx
      PDMTable.tsx
      CampaignModal.tsx
      PartnerModal.tsx
  /data
    mockData.ts (all mock data)
  /types
    analytics.types.ts (TypeScript interfaces)
```

## Other notes

- Add a lot of info tooltips to explain what the heck this data is
- As is done for workloads we want to also be able to filter by the PDM.
- Give performance chart on the partner performance view.

## Deliverables

Please generate:
1. Complete React components with TypeScript
2. Mock data file with realistic data
3. TypeScript type definitions
4. Basic README with instructions to run

Make it production-quality code with proper TypeScript types, clean component structure, and reusable patterns. Focus on making it look polished and professional for a demo to an executive audience.
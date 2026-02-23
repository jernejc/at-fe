import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tableData = [
  { company: 'Acme Corp', score: 92, signals: 8, status: 'Active' },
  { company: 'Globex Inc', score: 74, signals: 5, status: 'Active' },
  { company: 'Initech', score: 58, signals: 3, status: 'Paused' },
];

/** Data display components: table, avatar, progress, skeleton, separator, tabs. */
export function DataDisplaySection() {
  return (
    <section id="data-display" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Data Display</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Table, avatar, progress, tabs, skeleton, and separator.
        </p>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Table
        </h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Signals</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.company}>
                  <TableCell className="font-medium">{row.company}</TableCell>
                  <TableCell>{row.score}</TableCell>
                  <TableCell>{row.signals}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Avatars */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Avatar
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>L</AvatarFallback>
            </Avatar>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <AvatarGroup>
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+3</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Progress
        </h3>
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 text-xs text-muted-foreground tabular-nums">25%</span>
            <Progress value={25} className="h-2" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 text-xs text-muted-foreground tabular-nums">60%</span>
            <Progress value={60} className="h-2" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 text-xs text-muted-foreground tabular-nums">90%</span>
            <Progress value={90} className="h-2" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Tabs
        </h3>
        <div className="space-y-4">
          <Tabs defaultValue="default">
            <TabsList>
              <TabsTrigger value="default">Default Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="default">
              <p className="text-muted-foreground p-2">Default tab content.</p>
            </TabsContent>
            <TabsContent value="tab2">
              <p className="text-muted-foreground p-2">Tab 2 content.</p>
            </TabsContent>
            <TabsContent value="tab3">
              <p className="text-muted-foreground p-2">Tab 3 content.</p>
            </TabsContent>
          </Tabs>

          <Tabs defaultValue="line1">
            <TabsList variant="line">
              <TabsTrigger value="line1">Line Tab 1</TabsTrigger>
              <TabsTrigger value="line2">Line Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="line1">
              <p className="text-muted-foreground p-2">Line variant content.</p>
            </TabsContent>
            <TabsContent value="line2">
              <p className="text-muted-foreground p-2">Line tab 2 content.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Skeleton */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Skeleton
        </h3>
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Separator
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Horizontal</p>
          <Separator />
          <div className="flex items-center gap-3 h-6">
            <span className="text-sm text-muted-foreground">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-muted-foreground">Right</span>
          </div>
        </div>
      </div>
    </section>
  );
}

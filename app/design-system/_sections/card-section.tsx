import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';

/** Card compound component showcase. */
export function CardSection() {
  return (
    <section id="cards" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Card</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Container with header, content, and footer slots.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Default Size */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Overview</CardTitle>
            <CardDescription>
              Track active campaigns and partner engagement.
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              12 active campaigns across 3 product lines with 48 partner
              accounts enrolled.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              View all
            </Button>
          </CardFooter>
        </Card>

        {/* Small Size */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>Small Card</CardTitle>
            <CardDescription>Compact variant for dense layouts.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Uses tighter padding and smaller text.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="xs">
              Details
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

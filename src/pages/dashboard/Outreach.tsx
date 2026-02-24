import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function DashboardOutreach() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Outreach</h1>
        <p className="text-muted-foreground mt-1">Track and manage outreach campaigns.</p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Outreach campaigns</CardTitle>
          <p className="text-sm text-muted-foreground">Build sequences and launch campaigns.</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild className="gap-2">
            <Link to="/dashboard/outreach/sequences">
              <Send className="h-4 w-4" />
              Sequence builder
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

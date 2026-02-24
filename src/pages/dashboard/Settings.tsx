import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Settings</CardTitle>
          <p className="text-sm text-muted-foreground">Placeholder — add settings form here.</p>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}

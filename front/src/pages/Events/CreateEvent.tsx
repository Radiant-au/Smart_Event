import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { createEvent as createEventApi } from "@/api/event-api";
import { getCurrentUser } from "@/api/auth-api";

const CreateEvent = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const meRes = await getCurrentUser();
      const me = (meRes as any).data?.data ?? meRes.data;

      const payload = {
        name,
        description: description || undefined,
        userId: me.id,
        startDate: date ? new Date(date).toISOString() : undefined,
        endDate: undefined as string | undefined,
        location: location || undefined,
      };

      await createEventApi(payload as any);

      toast({
        title: "Card group created",
        description: "Your card group has been created successfully",
      });
      navigate("/events");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create card group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button onClick={() => navigate("/events")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Group</CardTitle>
            <CardDescription>
              Fill in the details to create a new group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Card Group Name</Label>
                <Input
                  id="name"
                  placeholder="Enter group name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you want to do"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location(Optional)</Label>
                <Input
                  id="location"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/components/auth-provider";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import UserPosts from "@/components/user-posts";
import { LogOut, Upload } from "lucide-react";
import { Database } from "@/lib/database.types";

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).optional(),
});

const notificationsFormSchema = z.object({
  pushNotifications: z.boolean().default(false),
  emailNotifications: z.boolean().default(false),
  reminders: z.boolean().default(false),
});

export default function ProfilePage() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      pushNotifications: user?.push_notifications || false,
      emailNotifications: user?.email_notifications || false,
      reminders: user?.reminders || false,
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Upload avatar if changed
      let avatarUrl = user.avatar_url;
      if (avatarFile) {
        // const { data: avatarData, error: avatarError } = await supabase.storage
        //   .from('avatars')
        //   .upload(`${user.id}`, avatarFile, {
        //     upsert: true,
        //   })
        // if (avatarError) throw avatarError
        // avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarData.path}`
      }

      // Update profile
      // const { error } = await supabase
      //   .from('profiles')
      //   .update({
      //     username: values.username,
      //     bio: values.bio,
      //     avatar_url: avatarUrl,
      //   })
      //   .eq('id', user.id)

      // if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationsSubmit = async (values: z.infer<typeof notificationsFormSchema>) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Update notification preferences
      // const { error } = await supabase
      //   .from('profiles')
      //   .update({
      //     push_notifications: values.pushNotifications,
      //     email_notifications: values.emailNotifications,
      //     reminders: values.reminders,
      //   })
      //   .eq('id', user.id)

      // if (error) throw error

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not signed in</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/login">Sign in</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={
                      avatarFile ? URL.createObjectURL(avatarFile) : user.avatar_url || undefined
                    }
                  />
                  <AvatarFallback className="text-2xl">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">Upload avatar</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Button variant="outline" className="mt-4 w-full gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posts</span>
                  <span className="font-medium">24</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Likes received</span>
                  <span className="font-medium">128</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-medium">37</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days active</span>
                  <span className="font-medium">62</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Tabs defaultValue="posts">
            <TabsList className="mb-6">
              <TabsTrigger value="posts">My Posts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              <UserPosts userId={user.id} />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your profile information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled type="email" />
                            </FormControl>
                            <FormDescription>
                              Email cannot be changed after registration.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Briefly describe yourself in 160 characters or less.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationsForm}>
                    <form
                      onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={notificationsForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex justify-between items-center space-y-0 rounded-md border p-4">
                            <div>
                              <FormLabel className="text-base">Push Notifications</FormLabel>
                              <FormDescription>
                                Receive push notifications on your device.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex justify-between items-center space-y-0 rounded-md border p-4">
                            <div>
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive email notifications about activity.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="reminders"
                        render={({ field }) => (
                          <FormItem className="flex justify-between items-center space-y-0 rounded-md border p-4">
                            <div>
                              <FormLabel className="text-base">Post Reminders</FormLabel>
                              <FormDescription>
                                Receive reminders to post regularly.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save preferences"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

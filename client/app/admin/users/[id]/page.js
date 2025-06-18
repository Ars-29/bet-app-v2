"use client";

import { useEffect, useState, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchUserDetails,
  updateUserDetails,
  selectSelectedUser,
  selectIsLoading,
  selectError,
} from "@/lib/features/admin/adminUserSlice";
import {
  selectUser,
  selectIsAuthenticated,
} from "@/lib/features/auth/authSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  DollarSign,
  Key,
  Activity,
  Save,
  X,
} from "lucide-react";

export default function UserDetails({ params }) {
  const { id } = use(params);
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const selectedUser = useSelector(selectSelectedUser);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
    isActive: true,
    password: "",
    balance: 0,
  });

  useEffect(() => {
    console.log("User Details Page - Selected User Changed:", selectedUser);
    if (selectedUser) {
      setFormData({
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        email: selectedUser.email || "",
        phoneNumber: selectedUser.phoneNumber || "",
        role: selectedUser.role || "",
        isActive: selectedUser.isActive,
        password: selectedUser.password || "",
        balance: selectedUser.balance || 0,
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserDetails(id));
    }
  }, [id, dispatch]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        updateUserDetails({ userId: id, userData: formData })
      ).unwrap();
      const updatedUser = result.user || result;

      if (updatedUser && (updatedUser._id || updatedUser.id)) {
        // Show success toast only here
        toast.success("User updated successfully");
        await dispatch(fetchUserDetails(id)).unwrap();
      } else {
        console.error("Invalid update response:", result);
        toast.error("Failed to update user: Invalid response from server");
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        (error.payload && error.payload.message) ||
        "Failed to update user";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="  ">
      <div className="container  px-2 py-3 ">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin")}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        {/* Header Section */}{" "}
        <div className="mb-2 sm:w-[93%] w-full mx-auto  ">
          <div className="flex flex-col  sm:flex-row sm:items-center sm:justify-between mb-3 ">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
              {/* <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Status:</span>
                <Badge
                  variant={selectedUser?.isActive ? "default" : "destructive"}
                  className={`${selectedUser?.isActive ? "bg-base":""}`}
                 
                >
                  <Activity className="w-1 h-1 mr-1" />
                  {selectedUser?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div> */}
            </div>
          </div>
        </div>
        {/* Main Form Card */}
        <Card className="rounded-none border-0 shadow-none bg-white sm:w-[93%] w-full  mx-auto backdrop-blur-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg  font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Edit User Information
            </CardTitle>
            <Separator className="mt-2" />
          </CardHeader>{" "}
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {" "}
              {/* Personal Information Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>{" "}
                  <h3 className="text-md font-semibold text-gray-900">
                    Personal Information
                  </h3>
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                      className="h-10  border-black "
                      placeholder="Enter first name"
                    />
                  </div>{" "}
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                      className="h-10  border-black "
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </div>
              <Separator /> {/* Contact Information Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>{" "}
                  <h3 className="text-md font-semibold text-gray-900">
                    Contact Information
                  </h3>
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {" "}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="h-10 border-black"
                      placeholder="Enter email address"
                    />
                  </div>{" "}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="h-10 border-black"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
              <Separator /> {/* Account Settings Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>{" "}
                  <h3 className="text-md font-semibold text-gray-900">
                    Account Settings
                  </h3>
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="role"
                      className="text-sm font-medium text-gray-700"
                    >
                      User Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger className="h-10  rounded-none">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            User
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>{" "}
                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Account Status
                    </Label>
                    <Select
                      value={formData.isActive ? "active" : "inactive"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          isActive: value === "active",
                        })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-none">
                        <SelectValue placeholder="Select account status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>{" "}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="h-10 border-black"
                      placeholder="Enter new password"
                    />{" "}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="balance"
                      className="text-sm font-medium text-gray-700"
                    >
                      Account Balance
                    </Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          balance: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-10 border-black"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <Separator />
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin")}
                  className="h-10 px-3 border-gray-200 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 px-3 bg-base hover:bg-base-dark text-white shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-2 h-2 mr-2 border-2 border-white border-t-transparent animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

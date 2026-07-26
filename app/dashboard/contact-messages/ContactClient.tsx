"use client";

import { useState } from "react";
import { Trash2, Eye, Mail, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateContactMessageStatus, deleteContactMessage } from "@/lib/actions/contact.actions";
import { DashboardAccess } from "@/lib/auth/rbac-rules";
import { usePermissions } from "@/lib/hooks/use-permissions";
import toast from "react-hot-toast";

type Props = {
  initialMessages: any[];
  access: DashboardAccess;
};

export default function ContactClient({ initialMessages, access }: Props) {
  const { hasPermission } = usePermissions(access);
  const canUpdate = hasPermission("contact-messages", "update");
  const canDelete = hasPermission("contact-messages", "delete");
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  const handleOpenDetail = async (msg: any) => {
    setSelectedMsg(msg);
    if (canUpdate && msg.status === "unread") {
      const res = await updateContactMessageStatus(msg._id, "read");
      if (res.success) {
        setMessages(messages.map((m) => (m._id === msg._id ? { ...m, status: "read" } : m)));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (!confirm("Delete this contact message?")) return;
    const res = await deleteContactMessage(id);
    if (res.success) {
      toast.success("Message deleted!");
      setMessages(messages.filter((m) => m._id !== id));
      if (selectedMsg?._id === id) setSelectedMsg(null);
    } else {
      toast.error(res.error || "Failed to delete message");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Form Messages</h1>
          <p className="text-sm text-gray-500">
            View inquiry messages submitted from the public contact page
          </p>
        </div>
      </div>

      <Dialog open={!!selectedMsg} onOpenChange={(val) => { if (!val) setSelectedMsg(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
          </DialogHeader>

          {selectedMsg && (
            <div className="space-y-4 py-2">
              <div className="border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900">{selectedMsg.name}</h3>
                {selectedMsg.subject && (
                  <p className="text-xs text-primary font-semibold">Subject: {selectedMsg.subject}</p>
                )}
                <p className="text-xs text-gray-500">
                  Received: {new Date(selectedMsg.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={16} className="text-primary" /> {selectedMsg.email}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={16} className="text-primary" /> {selectedMsg.phone || "N/A"}
                </div>
              </div>

              <div className="border p-4 rounded-md bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 mb-1">Message Content:</p>
                <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                  {selectedMsg.message}
                </p>
              </div>

              <div className="flex justify-end border-t pt-3">
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedMsg._id)}
                  >
                    Delete Message
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No contact messages received yet.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((msg: any) => (
                <TableRow key={msg._id} className={msg.status === "unread" ? "bg-amber-50/50 font-semibold" : ""}>
                  <TableCell className="text-gray-900">{msg.name}</TableCell>
                  <TableCell>{msg.subject || "General Inquiry"}</TableCell>
                  <TableCell className="text-xs">{msg.email}</TableCell>
                  <TableCell>
                    {msg.status === "unread" ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
                        Unread
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                        Read
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDetail(msg)}
                      title="Read Message"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(msg._id)}
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

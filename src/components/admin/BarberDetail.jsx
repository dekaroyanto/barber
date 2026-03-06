"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  Star,
  Calendar,
  Clock,
  Users,
  Edit,
  Mail,
  Phone,
  Award,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function BarberDetail({ open, onClose, barber, onEdit }) {
  if (!barber) return null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30";
      case "inactive":
        return "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30";
      case "busy":
        return "bg-amber-500/20 text-amber-500 border border-amber-500/30";
      case "off":
        return "bg-red-500/20 text-red-500 border border-red-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "inactive":
        return "Nonaktif";
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-500" />
            Detail Barber
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Informasi lengkap tentang barber
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Photo and Basic Info */}
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="w-24 h-24 rounded-lg bg-zinc-800 overflow-hidden border-2 border-zinc-700">
              {barber.image ? (
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-600/20 to-amber-500/20">
                  <Scissors className="h-8 w-8 text-amber-500" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {barber.name}
                  </h3>
                  <p className="text-amber-500 mt-1">{barber.specialty}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(barber.status)}`}
                >
                  {getStatusText(barber.status)}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="text-white font-medium">
                    {barber.rating || 0}
                  </span>
                  <span className="text-zinc-500 text-sm ml-1">/ 5</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {barber.total_bookings || 0} booking
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pengalaman */}
            <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Pengalaman</span>
              </div>
              <p className="text-white font-medium">
                {barber.experience
                  ? `${barber.experience} tahun`
                  : "Belum ada data"}
              </p>
            </div>

            {/* Bergabung Sejak */}
            <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Bergabung</span>
              </div>
              <p className="text-white font-medium">
                {barber.created_at
                  ? format(new Date(barber.created_at), "dd MMMM yyyy", {
                      locale: id,
                    })
                  : "-"}
              </p>
            </div>

            {/* Terakhir Update */}
            <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Terakhir Update</span>
              </div>
              <p className="text-white font-medium">
                {barber.updated_at
                  ? format(new Date(barber.updated_at), "dd MMMM yyyy", {
                      locale: id,
                    })
                  : "-"}
              </p>
            </div>

            {/* ID Barber */}
            <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Award className="h-4 w-4" />
                <span className="text-sm">ID Barber</span>
              </div>
              <p className="text-white font-medium text-sm truncate">
                {barber.id}
              </p>
            </div>
          </div>

          {/* Bio/Deskripsi */}
          {barber.bio && (
            <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Bio</h4>
              <p className="text-white text-sm leading-relaxed">{barber.bio}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Tutup
            </Button>
            <Button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Barber
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

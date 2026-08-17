import React, { useState, useEffect, useRef } from 'react';
import type { IncidentType, CitizenReport } from '../../types/traffic';
import { LocationPickerMap } from '../map/LocationPickerMap';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import {
  AlertTriangle,
  MapPin,
  Camera,
  User,
  Mail,
  Send,
  CheckCircle2,
  UploadCloud,
  X,
  Compass,
  FileCheck,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  Car,
  OctagonAlert,
  CloudRain,
  Flame
} from 'lucide-react';

export interface IncidentReportFormProps {
  onSubmitReport: (reportData: {
    incidentType: IncidentType;
    image: string;
    location: string;
    latitude: number;
    longitude: number;
    reporterName: string;
    reporterEmail: string;
    description: string;
  }) => CitizenReport;
  onNavigateToDashboard?: () => void;
}

const FOUR_INCIDENT_TYPES: { type: IncidentType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    type: 'Accident',
    label: '1. Accident',
    desc: 'Vehicle collision or crash casualty on road',
    icon: <Car className="w-5 h-5 text-red-400" />
  },
  {
    type: 'Road Blocked',
    label: '2. Road Blocked',
    desc: 'Fallen trees, debris, or unauthorized barricade',
    icon: <OctagonAlert className="w-5 h-5 text-amber-400" />
  },
  {
    type: 'Water Logging',
    label: '3. Water Logging',
    desc: 'Submerged underpass or deep monsoon puddle',
    icon: <CloudRain className="w-5 h-5 text-blue-400" />
  },
  {
    type: 'Heavy Congestion',
    label: '4. Heavy Congestion',
    desc: 'Severe bottleneck or non-functioning signal',
    icon: <Flame className="w-5 h-5 text-orange-400" />
  }
];

const PRESET_DEMO_IMAGES = [
  { label: 'Nagpur Waterlogging', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Nagpur Accident Collision', url: 'https://images.unsplash.com/photo-1543465077-db45d34b88a5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Nagpur Road Blocked', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' },
  { label: 'Nagpur Flyover Gridlock', url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80' }
];

export const IncidentReportForm: React.FC<IncidentReportFormProps> = ({
  onSubmitReport,
  onNavigateToDashboard
}) => {
  // Form State
  const [incidentType, setIncidentType] = useState<IncidentType>('Accident');
  const [uploadedImage, setUploadedImage] = useState<string>(PRESET_DEMO_IMAGES[0].url);
  const [isDragOver, setIsDragOver] = useState(false);
  const [locationName, setLocationName] = useState('Pardi Junction Flyover, East Nagpur');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 21.1542, lng: 79.1388 });
  const [gpsStatus, setGpsStatus] = useState<string>('Nagpur GPS Ready');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('Aniket Deshmukh');
  const [reporterEmail, setReporterEmail] = useState('aniket.deshmukh@nagpur.gov.in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<CitizenReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load citizen details from localStorage if present
  useEffect(() => {
    const savedName = localStorage.getItem('nirnay_citizen_name');
    const savedEmail = localStorage.getItem('nirnay_citizen_email');
    if (savedName) setReporterName(savedName);
    if (savedEmail) setReporterEmail(savedEmail);
  }, []);

  // Auto generated Date and Time
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Browser Geolocation Detector
  const handleAcquireGPS = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('Acquiring GPS...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsStatus('Browser GPS Locked');
        },
        () => {
          // Fallback if permission denied
          setCoords({ lat: 21.1542, lng: 79.1388 });
          setGpsStatus('Demo Fallback GPS (Nagpur Pardi Junction)');
        },
        { timeout: 5000 }
      );
    } else {
      setCoords({ lat: 21.1542, lng: 79.1388 });
      setGpsStatus('Demo Fallback GPS (Nagpur)');
    }
  };

  // Image Upload File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop Image Handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImage) {
      alert('Please upload or select an incident photograph.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const createdReport = onSubmitReport({
        incidentType,
        image: uploadedImage,
        location: locationName,
        latitude: coords.lat,
        longitude: coords.lng,
        reporterName,
        reporterEmail,
        description: description || `Citizen reported ${incidentType} hazard at ${locationName}.`
      });

      setSubmittedReceipt(createdReport);
      setIsSubmitting(false);
    }, 600);
  };

  // If report submitted successfully, render receipt confirmation screen
  if (submittedReceipt) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 text-slate-100 max-w-2xl mx-auto animate-in fade-in duration-300">
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/10">
            <FileCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Incident Report Submitted</h2>
          <p className="text-xs text-slate-400">
            Your report has been successfully dispatched to the Nagpur Traffic Police Command Center.
          </p>
        </div>

        {/* Receipt Card Details */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <div className="text-slate-400">Report ID</div>
              <div className="text-base font-bold text-amber-400 font-mono">{submittedReceipt.reportId}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 mb-0.5">Initial Status</div>
              <StatusBadge type="report" value={submittedReceipt.status} size="sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-slate-400 block mb-0.5">Incident Category</span>
              <span className="font-bold text-white text-sm">{submittedReceipt.incidentType}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Verification Status</span>
              <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 inline-block">
                {submittedReceipt.verificationStatus}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 block mb-0.5">Location Address</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {submittedReceipt.location}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Date: {submittedReceipt.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Time: {submittedReceipt.time}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex justify-between text-slate-400">
            <span>Reporter Contact:</span>
            <span className="text-slate-200">{submittedReceipt.reporterName} ({submittedReceipt.reporterEmail})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onNavigateToDashboard && (
            <Button
              variant="primary"
              size="lg"
              onClick={onNavigateToDashboard}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              className="w-full font-bold"
            >
              View on Citizen Dashboard
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setSubmittedReceipt(null);
              setDescription('');
            }}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="w-full"
          >
            Submit Another Incident
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl text-slate-100 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            INCIDENT INTAKE MODULE
          </span>
          <span className="text-xs text-slate-400">Nagpur Traffic Police Intake</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <span>Report Road Incident / Hazard</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload photo proof, select incident type, and pin GPS location to inform Nagpur Traffic Control.
        </p>
      </div>

      {/* 1. IMAGE UPLOAD AREA */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-purple-400" />
          <span>1. Upload Photograph (Required)</span>
        </label>

        {/* Drag and Drop Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-blue-400 bg-blue-950/40'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
          }`}
        >
          {uploadedImage ? (
            <div className="relative w-full max-h-56 rounded-xl overflow-hidden group">
              <img src={uploadedImage} alt="Incident Preview" className="w-full h-56 object-cover rounded-xl" />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Image
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setUploadedImage('')}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Remove Image
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Drag and drop your incident photo here</p>
                <p className="text-xs text-slate-400 mt-0.5">Supports JPG, PNG, WEBP files</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse & Upload Image
              </Button>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Demo Preset Photos Selector */}
        <div className="mt-3">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Or select a sample Nagpur demo photo:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_DEMO_IMAGES.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setUploadedImage(img.url)}
                className={`relative h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  uploadedImage === img.url
                    ? 'border-blue-500 scale-105 shadow-md'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent p-1 flex items-end">
                  <span className="text-[9px] text-slate-200 font-medium truncate">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SELECT INCIDENT TYPE (EXACT 4 OPTIONS AS CARDS/RADIO BUTTONS) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          2. Select Incident Type (Required)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FOUR_INCIDENT_TYPES.map((opt) => {
            const isSelected = incidentType === opt.type;
            return (
              <div
                key={opt.type}
                onClick={() => setIncidentType(opt.type)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="mt-0.5 shrink-0">{opt.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{opt.label}</h4>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AUTOMATICALLY COLLECTED & DISPLAYED DATA (LOCATION, GPS, DATE, TIME) */}
      <div className="space-y-4 pt-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>3. Incident Location & GPS Telemetry</span>
          </span>
          <button
            type="button"
            onClick={handleAcquireGPS}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{gpsStatus}</span>
          </button>
        </label>

        <LocationPickerMap
          initialLat={coords.lat}
          initialLng={coords.lng}
          onLocationSelect={(lat, lng) => {
            setCoords({ lat, lng });
            setGpsStatus('Custom Map Pin Selected');
          }}
          height="240px"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              Location Landmark / Address
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Pardi Flyover Junction, Nagpur"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              GPS Latitude & Longitude (Auto Collected)
            </label>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-400 flex items-center justify-between">
              <span>{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E</span>
              <button
                type="button"
                onClick={() => {
                  setCoords({ lat: 21.1542, lng: 79.1388 });
                  setGpsStatus('Demo Fallback GPS (Nagpur)');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline"
              >
                Use Demo GPS
              </button>
            </div>
          </div>
        </div>

        {/* Auto Generated Date & Time Display */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Date: <strong className="text-white">{currentDate}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Time: <strong className="text-white">{currentTime}</strong></span>
          </div>
        </div>
      </div>

      {/* 4. OPTIONAL SHORT DESCRIPTION */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Hazard Observations / Short Description (Optional)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Note any blocked lanes, stalled vehicles, severe water depth, or urgent safety concerns..."
          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Reporter Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" />
            <span>Reporter Name</span>
          </label>
          <input
            type="text"
            required
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-500" />
            <span>Reporter Email</span>
          </label>
          <input
            type="email"
            required
            value={reporterEmail}
            onChange={(e) => setReporterEmail(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="danger"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<Send className="w-4 h-4" />}
          className="w-full font-bold shadow-lg shadow-red-600/25"
        >
          SUBMIT INCIDENT REPORT
        </Button>
      </div>
    </form>
  );
};

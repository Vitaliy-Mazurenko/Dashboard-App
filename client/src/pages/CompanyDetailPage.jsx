import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToaster } from '../components/Toaster';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
const icon = L.icon({ iconUrl: "/img/marker-icon.png" });
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef();
  const [editMode, setEditMode] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);
  const { showToast } = useToaster();


  const token = localStorage.getItem('accessToken');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  const { data, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn:  async () => {
    const res = await api.get(`/companies/${id}`);
    return res.data;
  }
 }
);

  const updateMutation = useMutation({
    mutationFn:  (values) => api.put(`/companies/${id}`, values),
      onSuccess: () => {
        showToast('Company updated', 'success');
        queryClient.invalidateQueries({ queryKey: ['company', id]});
        setEditMode(false);
      },
      onError: () => showToast('Update failed', 'error'),
    },
  );

  const logoMutation = useMutation({
    mutationFn: (formData) => api.patch(`/companies/${id}/logo`, formData),
      onSuccess: () => {
        showToast('Logo updated', 'success');
        queryClient.invalidateQueries({ queryKey: ['company', id]});
      },
      onError: () => showToast('Logo update failed', 'error'),
    }
  );

  const deleteLogoMutation = useMutation({
    mutationFn: () => api.delete(`/companies/${id}/logo`),
      onSuccess: () => {
        showToast('Logo deleted', 'success');
        queryClient.invalidateQueries({ queryKey: ['company', id]});
      },
      onError: () => showToast('Logo delete failed', 'error'),
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Company not found</div>;

  const isOwner = userId && data.ownerId === userId;
  let locationArr = [50.455, 30.521];
  if (data.location) {
    const parts = data.location.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      locationArr = parts;
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <button onClick={() => navigate(-1)}>&larr; Back</button>
      <h2>Company Detail</h2>
      {!editMode ? (
        <>
          <div><strong>Name:</strong> {data.name}</div>
          <div><strong>Service:</strong> {data.service}</div>
          <div><strong>Capital:</strong> {data.capital}</div>
          <div><strong>Location:</strong> {data.location || 'Not set'}</div>
          <div><strong>Owner:</strong> {data.ownerId}</div>
          <div><strong>Created At:</strong> {new Date(data.createdAt).toLocaleDateString()}</div>
          <div style={{ margin: '16px 0' }}>
            <strong>Logo:</strong><br />
            {data.logo ? (
              <img src={`${API_URL}/${data.logo.replace(/\\/g, '/')}`} alt="logo" style={{ maxWidth: 120, maxHeight: 120 }} />
            ) : (
              <span>No logo</span>
            )}
            {isOwner && (
              <div style={{ marginTop: 8 }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('logo', file);
                      logoMutation.mutate(formData);
                    }
                  }}
                />
                <button onClick={() => fileInputRef.current.click()}>Upload/Change</button>
                {data.logo && <button onClick={() => deleteLogoMutation.mutate()}>Delete</button>}
              </div>
            )}
          </div>
          <div style={{ height: 300, marginBottom: 16 }}>
            <MapContainer center={locationArr} zoom={13} style={{ height: '100%' }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={locationArr} icon={icon}></Marker>
            </MapContainer>
          </div>
          {isOwner && <button onClick={() => {
            setEditMode(true);
            setMapPosition(locationArr);
          }}>Edit</button>}
        </>
      ) : (
        <form onSubmit={e => {
          e.preventDefault();
          const form = e.target;
          updateMutation.mutate({
            name: form.name.value,
            service: form.service.value,
            capital: form.capital.value,
            location: mapPosition ? mapPosition.join(',') : data.location,
          });
        }}>
          <div>
            <label>Name</label>
            <input name="name" defaultValue={data.name} required />
          </div>
          <div>
            <label>Service</label>
            <input name="service" defaultValue={data.service} required />
          </div>
          <div>
            <label>Capital</label>
            <input name="capital" type="number" defaultValue={data.capital} required />
          </div>
          <div style={{ height: 300, margin: '16px 0' }}>
            <label>Location (click on map to set)</label>
            <MapContainer center={mapPosition || locationArr} zoom={13} style={{ height: '100%' }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker position={mapPosition || locationArr} icon={icon} setPosition={setMapPosition} />
            </MapContainer>
          </div>
          <button type="submit" disabled={updateMutation.isLoading}>Save</button>
          <button type="button" onClick={() => setEditMode(false)} style={{ marginLeft: 8 }}>Cancel</button>
        </form>
      )}
    </div>
  );
}
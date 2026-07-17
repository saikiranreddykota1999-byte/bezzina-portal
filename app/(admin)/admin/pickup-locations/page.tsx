'use client';

import { useEffect, useState } from 'react';
import {
  addPickupUnavailableDateAction,
  deletePickupLocationAction,
  getPickupLocationDetails,
  getStaffPickupLocations,
  removePickupUnavailableDateAction,
  savePickupOpeningHoursAction,
  savePickupTimeSlotsAction,
  upsertPickupLocationAction,
} from '@/actions/pickup/staff';
import type {
  PickupLocation,
  PickupOpeningHour,
  PickupTimeSlot,
  PickupUnavailableDate,
} from '@/types/pickup';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  adminButtonDangerClass,
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminLabelClass,
  adminSubtextClass,
  adminTextareaClass,
} from '@/components/admin/admin-styles';
import { buildDefaultOpeningHours, DEFAULT_PICKUP_TIME_SLOTS } from '@/lib/pickup/defaults';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_HOURS = buildDefaultOpeningHours();

export default function AdminPickupLocationsPage() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [hours, setHours] = useState<PickupOpeningHour[]>(DEFAULT_HOURS);
  const [slots, setSlots] = useState<PickupTimeSlot[]>([]);
  const [unavailable, setUnavailable] = useState<PickupUnavailableDate[]>([]);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    line1: '',
    line2: '',
    city: '',
    postal_code: '',
    country: 'Malta',
    phone: '',
    email: '',
    instructions: '',
    is_active: true,
    sort_order: 0,
  });
  const [closedDate, setClosedDate] = useState('');
  const [closedReason, setClosedReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadLocations() {
    const result = await getStaffPickupLocations();
    if (result.success) {
      setLocations(result.data ?? []);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const result = await getStaffPickupLocations();
      if (cancelled) return;
      if (result.success) {
        setLocations(result.data ?? []);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function loadDetails() {
      const result = await getPickupLocationDetails(selectedId);
      if (cancelled || !result.success || !result.data) return;

      const { location, hours: locationHours, slots: locationSlots, unavailable: closedDates } =
        result.data;
      setForm({
        name: location.name,
        slug: location.slug,
        line1: location.line1,
        line2: location.line2 ?? '',
        city: location.city,
        postal_code: location.postal_code,
        country: location.country,
        phone: location.phone ?? '',
        email: location.email ?? '',
        instructions: location.instructions ?? '',
        is_active: location.is_active,
        sort_order: location.sort_order,
      });
      setHours(
        DEFAULT_HOURS.map((defaultHour) => {
          const match = locationHours.find(
            (hour) => hour.day_of_week === defaultHour.day_of_week,
          );
          return match ?? { ...defaultHour, location_id: selectedId };
        }),
      );
      setSlots(locationSlots);
      setUnavailable(closedDates);
    }

    void loadDetails();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleSaveLocation() {
    setMessage('');
    setError('');
    const result = await upsertPickupLocationAction({
      id: selectedId || undefined,
      location: form,
    });
    if (!result.success) {
      setError(result.error ?? 'Failed to save location');
      return;
    }
    setMessage('Location saved');
    await loadLocations();
    if (result.data) setSelectedId(result.data.id);
  }

  async function handleSaveHours() {
    if (!selectedId) return;
    const result = await savePickupOpeningHoursAction({
      locationId: selectedId,
      hours: hours.map(({ day_of_week, opens_at, closes_at, is_closed }) => ({
        day_of_week,
        opens_at,
        closes_at,
        is_closed,
      })),
    });
    setMessage(result.success ? 'Opening hours saved' : '');
    setError(result.success ? '' : result.error ?? 'Failed to save hours');
  }

  async function handleSaveSlots() {
    if (!selectedId) return;
    const result = await savePickupTimeSlotsAction({
      locationId: selectedId,
      slots: slots.map(({ slot_time, label, max_capacity, is_active }) => ({
        slot_time,
        label,
        max_capacity,
        is_active,
      })),
    });
    setMessage(result.success ? 'Time slots saved' : '');
    setError(result.success ? '' : result.error ?? 'Failed to save slots');
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Pickup Locations"
        description="Manage branches, opening hours, unavailable dates, and slot capacity."
      />

      {(message || error) && (
        <p className={`text-sm ${error ? 'text-[var(--admin-danger)]' : 'text-[var(--admin-success)]'}`}>
          {error || message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className={`${adminCardClass} p-4`}>
          <button
            type="button"
            className={`mb-4 w-full ${adminButtonPrimaryClass}`}
            onClick={() => {
              setSelectedId('');
              setForm({
                name: '',
                slug: '',
                line1: '',
                line2: '',
                city: '',
                postal_code: '',
                country: 'Malta',
                phone: '',
                email: '',
                instructions: '',
                is_active: true,
                sort_order: locations.length,
              });
            }}
          >
            New location
          </button>
          <ul className="space-y-2">
            {locations.map((location) => (
              <li key={location.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(location.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    selectedId === location.id
                      ? 'bg-[var(--admin-primary)] text-white'
                      : 'text-[var(--admin-navy)] hover:bg-[var(--admin-border-light)]'
                  }`}
                >
                  {location.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-6">
          <section className={`${adminCardClass} p-6`}>
            <h2 className={adminHeadingClass}>Location details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ['name', 'Name'],
                ['slug', 'Slug'],
                ['line1', 'Address line 1'],
                ['line2', 'Address line 2'],
                ['city', 'City'],
                ['postal_code', 'Postal code'],
                ['country', 'Country'],
                ['phone', 'Phone'],
                ['email', 'Email'],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm">
                  <span className={`mb-1 block ${adminLabelClass}`}>{label}</span>
                  <input
                    value={form[key as keyof typeof form] as string}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [key]: event.target.value }))
                    }
                    className={adminInputClass}
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block text-sm">
              <span className={`mb-1 block ${adminLabelClass}`}>Pickup instructions</span>
              <textarea
                value={form.instructions}
                onChange={(event) =>
                  setForm((current) => ({ ...current, instructions: event.target.value }))
                }
                rows={4}
                className={adminTextareaClass}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-4">
              <label className={`flex items-center gap-2 text-sm ${adminSubtextClass}`}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, is_active: event.target.checked }))
                  }
                />
                Active
              </label>
              <button type="button" onClick={handleSaveLocation} className={adminButtonPrimaryClass}>
                Save location
              </button>
              {selectedId && (
                <button
                  type="button"
                  className={adminButtonDangerClass}
                  onClick={async () => {
                    const result = await deletePickupLocationAction(selectedId);
                    if (result.success) {
                      setSelectedId('');
                      await loadLocations();
                    }
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </section>

          {selectedId && (
            <>
              <section className={`${adminCardClass} p-6`}>
                <div className="flex items-center justify-between gap-4">
                  <h2 className={adminHeadingClass}>Opening hours</h2>
                  <button type="button" className={adminButtonSecondaryClass} onClick={handleSaveHours}>
                    Save hours
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {hours.map((hour, index) => (
                    <div key={hour.day_of_week} className="grid gap-3 md:grid-cols-4">
                      <p className="self-center text-sm font-medium text-[var(--admin-navy)]">
                        {DAY_LABELS[hour.day_of_week]}
                      </p>
                      <input
                        type="time"
                        value={hour.opens_at.slice(0, 5)}
                        disabled={hour.is_closed}
                        onChange={(event) => {
                          const next = [...hours];
                          next[index] = { ...hour, opens_at: `${event.target.value}:00` };
                          setHours(next);
                        }}
                        className={adminInputClass}
                      />
                      <input
                        type="time"
                        value={hour.closes_at.slice(0, 5)}
                        disabled={hour.is_closed}
                        onChange={(event) => {
                          const next = [...hours];
                          next[index] = { ...hour, closes_at: `${event.target.value}:00` };
                          setHours(next);
                        }}
                        className={adminInputClass}
                      />
                      <label className={`flex items-center gap-2 text-sm ${adminSubtextClass}`}>
                        <input
                          type="checkbox"
                          checked={hour.is_closed}
                          onChange={(event) => {
                            const next = [...hours];
                            next[index] = { ...hour, is_closed: event.target.checked };
                            setHours(next);
                          }}
                        />
                        Closed
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              <section className={`${adminCardClass} p-6`}>
                <div className="flex items-center justify-between gap-4">
                  <h2 className={adminHeadingClass}>Time slot capacity</h2>
                  <button
                    type="button"
                    className={adminButtonSecondaryClass}
                    onClick={() =>
                      setSlots((current) => [
                        ...current,
                        {
                          id: crypto.randomUUID(),
                          location_id: selectedId,
                          slot_time: DEFAULT_PICKUP_TIME_SLOTS[0].slot_time,
                          label: DEFAULT_PICKUP_TIME_SLOTS[0].label,
                          max_capacity: DEFAULT_PICKUP_TIME_SLOTS[0].max_capacity,
                          is_active: true,
                        },
                      ])
                    }
                  >
                    Add slot
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {slots.map((slot, index) => (
                    <div key={slot.id} className="grid gap-3 md:grid-cols-4">
                      <input
                        type="time"
                        value={slot.slot_time.slice(0, 5)}
                        onChange={(event) => {
                          const next = [...slots];
                          next[index] = { ...slot, slot_time: `${event.target.value}:00` };
                          setSlots(next);
                        }}
                        className={adminInputClass}
                      />
                      <input
                        value={slot.label}
                        onChange={(event) => {
                          const next = [...slots];
                          next[index] = { ...slot, label: event.target.value };
                          setSlots(next);
                        }}
                        className={adminInputClass}
                      />
                      <input
                        type="number"
                        min={1}
                        value={slot.max_capacity}
                        onChange={(event) => {
                          const next = [...slots];
                          next[index] = {
                            ...slot,
                            max_capacity: Number(event.target.value),
                          };
                          setSlots(next);
                        }}
                        className={adminInputClass}
                      />
                      <label className={`flex items-center gap-2 text-sm ${adminSubtextClass}`}>
                        <input
                          type="checkbox"
                          checked={slot.is_active}
                          onChange={(event) => {
                            const next = [...slots];
                            next[index] = { ...slot, is_active: event.target.checked };
                            setSlots(next);
                          }}
                        />
                        Active
                      </label>
                    </div>
                  ))}
                </div>
                <button type="button" className={`mt-4 ${adminButtonPrimaryClass}`} onClick={handleSaveSlots}>
                  Save slots
                </button>
              </section>

              <section className={`${adminCardClass} p-6`}>
                <h2 className={adminHeadingClass}>Unavailable dates</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  <input
                    type="date"
                    value={closedDate}
                    onChange={(event) => setClosedDate(event.target.value)}
                    className={adminInputClass}
                  />
                  <input
                    value={closedReason}
                    onChange={(event) => setClosedReason(event.target.value)}
                    placeholder="Reason"
                    className={adminInputClass}
                  />
                  <button
                    type="button"
                    className={adminButtonSecondaryClass}
                    onClick={async () => {
                      if (!closedDate) return;
                      const result = await addPickupUnavailableDateAction({
                        locationId: selectedId,
                        entry: { closed_date: closedDate, reason: closedReason || null },
                      });
                      if (result.success) {
                        setClosedDate('');
                        setClosedReason('');
                        const details = await getPickupLocationDetails(selectedId);
                        if (details.success && details.data) {
                          setUnavailable(details.data.unavailable);
                        }
                      }
                    }}
                  >
                    Add date
                  </button>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {unavailable.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] px-3 py-2"
                    >
                      <span className={adminSubtextClass}>
                        {entry.closed_date}
                        {entry.reason ? ` — ${entry.reason}` : ''}
                      </span>
                      <button
                        type="button"
                        className="text-[var(--admin-danger)] hover:underline"
                        onClick={async () => {
                          await removePickupUnavailableDateAction(entry.id);
                          setUnavailable((current) => current.filter((item) => item.id !== entry.id));
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

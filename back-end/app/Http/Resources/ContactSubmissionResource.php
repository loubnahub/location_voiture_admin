<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactSubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'subject' => $this->subject,
            'message' => $this->message,
            'is_read' => (bool) $this->is_read,
            'admin_notes' => $this->admin_notes,
            'user_id' => $this->user_id,
            // 'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)), // If you load user relation
            'submitted_at' => $this->created_at->toDayDateTimeString(), // More human-readable for admin
            'created_at_iso' => $this->created_at->toIso8601String(),
            'updated_at_iso' => $this->updated_at->toIso8601String(),
        ];
    }
}
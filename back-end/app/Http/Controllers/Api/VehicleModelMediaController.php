<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleModel;
use App\Models\VehicleModelMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class VehicleModelMediaController extends Controller
{
    /**
     * Helper to transform media data for API response.
     */
    protected function transformMedia(VehicleModelMedia $media): array
    {
        return [
            'id' => $media->id,
            'vehicle_model_id' => $media->vehicle_model_id,
            'url' => Storage::disk('public')->url($media->url),
            'caption' => $media->caption,
            'is_cover' => (bool) $media->is_cover,
            'order' => (int) $media->order,
            'media_type' => $media->media_type ?? 'image',
            'uploaded_at' => $media->uploaded_at ? $media->uploaded_at->toIso8601String() : null,
            'color_hex' => $media->color_hex, // <-- Add this
        ];
    }

    public function index(VehicleModel $vehicleModel)
    {
        $mediaItems = $vehicleModel->media()
                                   ->orderBy('order', 'asc')
                                   ->orderBy('uploaded_at', 'desc')
                                   ->get();

        return response()->json(['data' => $mediaItems->map(fn($media) => $this->transformMedia($media))]);
    }

    public function store(Request $request, VehicleModel $vehicleModel)
    {
        $validator = Validator::make($request->all(), [
            'media_files'   => 'required|array|min:1',
            'media_files.*' => [
                'required',
                'file',
    'mimetypes:image/jpeg,image/png,image/gif,image/webp,model/gltf-binary,application/octet-stream',
                'max:10240',
            ],
            'color_hexes' => 'nullable|array',
            'color_hexes.*' => 'nullable|string|max:10',
            'captions'      => 'nullable|array',
            'captions.*'    => 'nullable|string|max:255',
            'is_cover_flags' => 'nullable|array',
            'is_cover_flags.*' => 'boolean',
            'media_types'    => 'nullable|array',
            'media_types.*'  => 'nullable|string|in:image,3d_model_glb,video',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $uploadedMediaItemsTransformed = [];
        $files = $request->file('media_files');

        DB::beginTransaction();

        try {
            $newCoverIndex = -1;
            $isAnyNewCover = false;
            if ($request->has('is_cover_flags')) {
                foreach($request->input('is_cover_flags') as $index => $isCoverInput) {
                    if (filter_var($isCoverInput, FILTER_VALIDATE_BOOLEAN)) {
                        $newCoverIndex = $index;
                        $isAnyNewCover = true;
                        break;
                    }
                }
            }

            if ($isAnyNewCover) {
                $vehicleModel->media()->where('is_cover', true)->update(['is_cover' => false]);
            }

            $maxOrder = $vehicleModel->media()->max('order') ?? 0;

            foreach ($files as $index => $file) {
                $originalName = $file->getClientOriginalName();
                $extension = strtolower($file->getClientOriginalExtension());
                $fileName = Str::uuid() . '.' . $extension;
                $storagePath = 'vehicle_media/' . $vehicleModel->id;
                $path = $file->storeAs($storagePath, $fileName, 'public');

                if (!$path) {
                    throw new \Exception("Failed to store file: {$originalName}");
                }

                $mediaType = $request->input("media_types.{$index}");
                if (empty($mediaType)) {
                    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                    if (in_array($extension, $imageExtensions)) { $mediaType = 'image'; }
                    elseif ($extension === 'glb') { $mediaType = '3d_model_glb'; }
                    else { $mediaType = 'other'; }
                }
                
                $isCoverForThisFile = ($newCoverIndex === $index);

                // If no new cover specified and this is the first image for the model, make it cover.
                if (!$isAnyNewCover && $mediaType === 'image' && !$vehicleModel->media()->where('is_cover', true)->where('media_type', 'image')->exists()) {
                    if ($vehicleModel->media()->where('media_type', 'image')->count() === 0) {
                         $isCoverForThisFile = true;
                    }
                }

                // Get color_hex for this file (if provided)
                $colorHex = $request->input("color_hexes.{$index}", null);

                $mediaItem = $vehicleModel->media()->create([
                    'url'         => $path,
                    'caption'     => $request->input("captions.{$index}", pathinfo($originalName, PATHINFO_FILENAME)),
                    'is_cover'    => $isCoverForThisFile && ($mediaType === 'image'),
                    'order'       => ++$maxOrder,
                    'media_type'  => $mediaType,
                    'uploaded_at' => now(),
                    'color_hex'   => $colorHex, // <-- Save color_hex
                ]);
                $uploadedMediaItemsTransformed[] = $this->transformMedia($mediaItem);
            }

            DB::commit();
            return response()->json(['data' => $uploadedMediaItemsTransformed, 'message' => 'Media uploaded successfully.'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Media upload failed for VehicleModel ID ' . $vehicleModel->id . ': ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Media upload failed due to a server error.', 'error_detail' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, VehicleModelMedia $medium)
    {
        $validator = Validator::make($request->all(), [
            'caption'  => 'sometimes|nullable|string|max:255',
            'is_cover' => 'sometimes|boolean',
            'color_hex' => 'sometimes|nullable|string|max:10', // <-- Add this
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $updated = false;

        DB::beginTransaction();
        try {
            if (array_key_exists('is_cover', $validatedData)) {
                $isCoverRequest = filter_var($validatedData['is_cover'], FILTER_VALIDATE_BOOLEAN);

                if ($isCoverRequest && $medium->media_type === 'image') {
                    VehicleModelMedia::where('vehicle_model_id', $medium->vehicle_model_id)
                                     ->where('id', '!=', $medium->id)
                                     ->where('media_type', 'image')
                                     ->update(['is_cover' => false]);
                    $medium->is_cover = true;
                } elseif (!$isCoverRequest && $medium->is_cover) {
                    $medium->is_cover = false;
                    $otherCoverExists = VehicleModelMedia::where('vehicle_model_id', $medium->vehicle_model_id)
                                                        ->where('is_cover', true)
                                                        ->where('media_type', 'image')
                                                        ->exists();
                    if (!$otherCoverExists) {
                        $firstOtherImage = VehicleModelMedia::where('vehicle_model_id', $medium->vehicle_model_id)
                                                        ->where('media_type', 'image')
                                                        ->orderBy('order', 'asc')->first();
                        if ($firstOtherImage) {
                             $firstOtherImage->update(['is_cover' => true]);
                        }
                    }
                }
                if($medium->media_type !== 'image') {
                    $medium->is_cover = false;
                }
                $updated = true;
            }

            if (isset($validatedData['caption'])) {
                $medium->caption = $validatedData['caption'];
                $updated = true;
            }

            if (isset($validatedData['color_hex'])) { // <-- Add this
                $medium->color_hex = $validatedData['color_hex'];
                $updated = true;
            }

            if ($updated) {
                $medium->save();
            }
            DB::commit();

            return response()->json(['data' => $this->transformMedia($medium->fresh()), 'message' => 'Media item updated successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Media update failed for media ID ' . $medium->id . ': ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Media update failed.', 'error_detail' => $e->getMessage()], 500);
        }
    }

    public function destroy(VehicleModelMedia $medium)
    {
        DB::beginTransaction();
        try {
            $filePath = $medium->url;
            $wasCover = $medium->is_cover;
            $vehicleModelId = $medium->vehicle_model_id;

            $medium->delete();

            if ($wasCover) {
                $nextCover = VehicleModelMedia::where('vehicle_model_id', $vehicleModelId)
                                             ->where('media_type', 'image')
                                             ->orderBy('order', 'asc')
                                             ->first();
                if ($nextCover) {
                    $nextCover->update(['is_cover' => true]);
                }
            }

            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            DB::commit();
            return response()->json(['message' => 'Media item deleted successfully.'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Media deletion failed for media ID ' . $medium->id . ': ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Media deletion failed.', 'error_detail' => $e->getMessage()], 500);
        }
    }

    public function reorder(Request $request, VehicleModel $vehicleModel)
    {
        $validator = Validator::make($request->all(), [
            'ordered_media_ids'   => 'required|array',
            'ordered_media_ids.*' => [
                'required',
                'string',
                Rule::exists('vehicle_model_media', 'id')->where(function ($query) use ($vehicleModel) {
                    $query->where('vehicle_model_id', $vehicleModel->id);
                }),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            foreach ($request->input('ordered_media_ids') as $index => $mediaId) {
                VehicleModelMedia::where('id', $mediaId)
                                 ->update(['order' => $index + 1]);
            }
            DB::commit();

            $updatedMedia = $vehicleModel->media()->orderBy('order', 'asc')->get()->map(fn($m) => $this->transformMedia($m));
            return response()->json(['data' => $updatedMedia, 'message' => 'Media reordered successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Media reorder failed for VehicleModel ID ' . $vehicleModel->id . ': ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Media reorder failed.', 'error_detail' => $e->getMessage()], 500);
        }
    }
}
<?php

namespace App\Listeners;

use App\Models\OperationalHold;
use App\Services\VehicleStatusService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class OperationalHoldStatusTriggerListener 
{
    public function __construct(protected VehicleStatusService $vehicleStatusService) {}

    public function handle(object $event): void
    {
        if ($event->model instanceof OperationalHold) {
            if ($event->model->vehicle_id) {
                $this->vehicleStatusService->updateStatus($event->model->vehicle_id);
            }
        }
    }
}
<?php

namespace App\Enums;

enum DamageReportStatus: string
{
    case PENDING_ASSESSMENT = 'pending_assessment';
    case UNDER_ASSESSMENT = 'under_assessment';
    case ASSESSMENT_COMPLETE = 'assessment_complete';
    case REPAIR_IN_PROGRESS = 'repair_in_progress';
    case REPAIR_PENDING_PARTS = 'repair_pending_parts';
    case REPAIRED_PENDING_QC = 'repaired_pending_qc';
    case RESOLVED_NO_COST = 'resolved_no_cost';
    case RESOLVED_AWAITING_PAYMENT = 'resolved_awaiting_payment';
    case RESOLVED_PAID = 'resolved_paid';
    case DISPUTED = 'disputed';
    case CLOSED = 'closed'; // General closed status
}
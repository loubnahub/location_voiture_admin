<?php

namespace App\Enums;

enum DamageReportStatus: string
{
    case REPORTED = 'reported';           
    case UNDER_INVESTIGATION = 'under_investigation'; 
    case AWAITING_REPAIR_QUOTE = 'awaiting_repair_quote';
    case REPAIR_PENDING = 'repair_pending';   
    case IN_REPAIR = 'in_repair';
    case REPAIRED = 'repaired';
    case RESOLVED_NO_REPAIR = 'resolved_no_repair'; 
    case CLOSED_WITH_CHARGE = 'closed_with_charge'; 
    case CLOSED_NO_CHARGE = 'closed_no_charge';   
}
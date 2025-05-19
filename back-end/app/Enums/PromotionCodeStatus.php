<?php
namespace App\Enums;
enum PromotionCodeStatus: string
{
    case ACTIVE = 'active';
    case USED = 'used';
    case EXPIRED = 'expired';
}
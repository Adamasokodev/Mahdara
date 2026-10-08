<?php

namespace App\Filament\Resources\Cheikhs\Pages;

use App\Filament\Resources\Cheikhs\CheikhResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewCheikh extends ViewRecord
{
    protected static string $resource = CheikhResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}

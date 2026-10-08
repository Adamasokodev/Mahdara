<?php

namespace App\Filament\Resources\Cheikhs\Pages;

use App\Filament\Resources\Cheikhs\CheikhResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditCheikh extends EditRecord
{
    protected static string $resource = CheikhResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}

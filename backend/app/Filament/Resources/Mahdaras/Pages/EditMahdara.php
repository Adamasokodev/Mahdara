<?php

namespace App\Filament\Resources\Mahdaras\Pages;

use App\Filament\Resources\Mahdaras\MahdaraResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditMahdara extends EditRecord
{
    protected static string $resource = MahdaraResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

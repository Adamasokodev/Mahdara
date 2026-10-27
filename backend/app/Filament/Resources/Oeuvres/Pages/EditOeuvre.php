<?php

namespace App\Filament\Resources\Oeuvres\Pages;

use App\Filament\Resources\Oeuvres\OeuvreResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditOeuvre extends EditRecord
{
    protected static string $resource = OeuvreResource::class;

    protected function getHeaderActions(): array
    {
        return [DeleteAction::make()];
    }
}

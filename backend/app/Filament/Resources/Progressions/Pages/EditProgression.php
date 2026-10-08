<?php

namespace App\Filament\Resources\Progressions\Pages;

use App\Filament\Resources\Progressions\ProgressionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProgression extends EditRecord
{
    protected static string $resource = ProgressionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

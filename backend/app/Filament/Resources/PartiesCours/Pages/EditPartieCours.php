<?php

namespace App\Filament\Resources\PartiesCours\Pages;

use App\Filament\Resources\PartiesCours\PartieCoursResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartieCours extends EditRecord
{
    protected static string $resource = PartieCoursResource::class;

    protected function getHeaderActions(): array
    {
        return [DeleteAction::make()];
    }
}

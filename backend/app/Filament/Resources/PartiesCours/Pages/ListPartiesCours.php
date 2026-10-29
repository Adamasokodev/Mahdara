<?php

namespace App\Filament\Resources\PartiesCours\Pages;

use App\Filament\Resources\PartiesCours\PartieCoursResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartiesCours extends ListRecords
{
    protected static string $resource = PartieCoursResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}

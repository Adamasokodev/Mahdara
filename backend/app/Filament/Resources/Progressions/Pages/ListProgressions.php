<?php

namespace App\Filament\Resources\Progressions\Pages;

use App\Filament\Resources\Progressions\ProgressionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProgressions extends ListRecords
{
    protected static string $resource = ProgressionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

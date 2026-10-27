<?php

namespace App\Filament\Resources\Oeuvres\Pages;

use App\Filament\Resources\Oeuvres\OeuvreResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListOeuvres extends ListRecords
{
    protected static string $resource = OeuvreResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}

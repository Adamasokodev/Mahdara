<?php

namespace App\Filament\Resources\Cheikhs\Pages;

use App\Filament\Resources\Cheikhs\CheikhResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCheikhs extends ListRecords
{
    protected static string $resource = CheikhResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

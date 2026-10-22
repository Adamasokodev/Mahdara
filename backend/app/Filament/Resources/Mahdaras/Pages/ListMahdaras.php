<?php

namespace App\Filament\Resources\Mahdaras\Pages;

use App\Filament\Resources\Mahdaras\MahdaraResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListMahdaras extends ListRecords
{
    protected static string $resource = MahdaraResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

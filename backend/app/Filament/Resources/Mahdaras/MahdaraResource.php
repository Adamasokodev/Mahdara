<?php

namespace App\Filament\Resources\Mahdaras;

use App\Filament\Resources\Mahdaras\Pages\CreateMahdara;
use App\Filament\Resources\Mahdaras\Pages\EditMahdara;
use App\Filament\Resources\Mahdaras\Pages\ListMahdaras;
use App\Filament\Resources\Mahdaras\Schemas\MahdaraForm;
use App\Filament\Resources\Mahdaras\Tables\MahdarasTable;
use App\Models\Mahdara;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class MahdaraResource extends Resource
{
    protected static ?string $model = Mahdara::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingLibrary;

    protected static ?string $recordTitleAttribute = 'nom';

    protected static ?string $modelLabel = 'mahdara';

    protected static ?string $pluralModelLabel = 'mahadras';

    public static function form(Schema $schema): Schema
    {
        return MahdaraForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MahdarasTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMahdaras::route('/'),
            'create' => CreateMahdara::route('/create'),
            'edit' => EditMahdara::route('/{record}/edit'),
        ];
    }
}

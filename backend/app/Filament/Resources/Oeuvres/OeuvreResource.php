<?php

namespace App\Filament\Resources\Oeuvres;

use App\Filament\Resources\Oeuvres\Pages\CreateOeuvre;
use App\Filament\Resources\Oeuvres\Pages\EditOeuvre;
use App\Filament\Resources\Oeuvres\Pages\ListOeuvres;
use App\Filament\Resources\Oeuvres\Schemas\OeuvreForm;
use App\Filament\Resources\Oeuvres\Tables\OeuvresTable;
use App\Models\Oeuvre;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OeuvreResource extends Resource
{
    protected static ?string $model = Oeuvre::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedBookOpen;

    protected static ?string $recordTitleAttribute = 'titre';

    protected static ?string $modelLabel = 'œuvre';

    protected static ?string $pluralModelLabel = 'bibliothèque';

    protected static ?string $navigationLabel = 'Bibliothèque';

    public static function form(Schema $schema): Schema
    {
        return OeuvreForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OeuvresTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOeuvres::route('/'),
            'create' => CreateOeuvre::route('/create'),
            'edit' => EditOeuvre::route('/{record}/edit'),
        ];
    }
}

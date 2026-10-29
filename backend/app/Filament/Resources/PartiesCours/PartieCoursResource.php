<?php

namespace App\Filament\Resources\PartiesCours;

use App\Filament\Resources\PartiesCours\Pages\CreatePartieCours;
use App\Filament\Resources\PartiesCours\Pages\EditPartieCours;
use App\Filament\Resources\PartiesCours\Pages\ListPartiesCours;
use App\Filament\Resources\PartiesCours\Schemas\PartieCoursForm;
use App\Filament\Resources\PartiesCours\Tables\PartiesCoursTable;
use App\Models\PartieCours;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartieCoursResource extends Resource
{
    protected static ?string $model = PartieCours::class;

    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedBookOpen;

    protected static ?string $recordTitleAttribute = 'titre';

    protected static ?string $modelLabel = 'partie de cours';

    protected static ?string $pluralModelLabel = 'parties de cours';

    protected static ?string $navigationLabel = 'Parties de cours';

    public static function form(Schema $schema): Schema
    {
        return PartieCoursForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartiesCoursTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPartiesCours::route('/'),
            'create' => CreatePartieCours::route('/create'),
            'edit' => EditPartieCours::route('/{record}/edit'),
        ];
    }
}

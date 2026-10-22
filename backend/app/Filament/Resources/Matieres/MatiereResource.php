<?php

namespace App\Filament\Resources\Matieres;

use App\Filament\Resources\Matieres\Pages\CreateMatiere;
use App\Filament\Resources\Matieres\Pages\EditMatiere;
use App\Filament\Resources\Matieres\Pages\ListMatieres;
use App\Filament\Resources\Matieres\Schemas\MatiereForm;
use App\Filament\Resources\Matieres\Tables\MatieresTable;
use App\Models\Matiere;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class MatiereResource extends Resource
{
    protected static ?string $model = Matiere::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedAcademicCap;

    protected static ?string $recordTitleAttribute = 'nom';

    protected static ?string $modelLabel = 'matière';

    protected static ?string $pluralModelLabel = 'matières';

    public static function form(Schema $schema): Schema
    {
        return MatiereForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MatieresTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMatieres::route('/'),
            'create' => CreateMatiere::route('/create'),
            'edit' => EditMatiere::route('/{record}/edit'),
        ];
    }
}

<?php

namespace App\Filament\Resources\Cours;

use App\Filament\Resources\Cours\Pages\CreateCours;
use App\Filament\Resources\Cours\Pages\EditCours;
use App\Filament\Resources\Cours\Pages\ListCours;
use App\Filament\Resources\Cours\Schemas\CoursForm;
use App\Filament\Resources\Cours\Tables\CoursTable;
use App\Models\Cours;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CoursResource extends Resource
{
    protected static ?string $model = Cours::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-book-open';

    protected static ?string $recordTitleAttribute = 'Cours';

    public static function form(Schema $schema): Schema
    {
        return CoursForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CoursTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCours::route('/'),
            'create' => CreateCours::route('/create'),
            'edit' => EditCours::route('/{record}/edit'),
        ];
    }
}

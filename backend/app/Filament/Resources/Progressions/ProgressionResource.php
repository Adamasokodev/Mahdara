<?php

namespace App\Filament\Resources\Progressions;

use App\Filament\Resources\Progressions\Pages\CreateProgression;
use App\Filament\Resources\Progressions\Pages\EditProgression;
use App\Filament\Resources\Progressions\Pages\ListProgressions;
use App\Filament\Resources\Progressions\Schemas\ProgressionForm;
use App\Filament\Resources\Progressions\Tables\ProgressionsTable;
use App\Models\Progression;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ProgressionResource extends Resource
{
    protected static ?string $model = Progression::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?string $recordTitleAttribute = 'Progression';

    public static function form(Schema $schema): Schema
    {
        return ProgressionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ProgressionsTable::configure($table);
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
            'index' => ListProgressions::route('/'),
            'create' => CreateProgression::route('/create'),
            'edit' => EditProgression::route('/{record}/edit'),
        ];
    }
}

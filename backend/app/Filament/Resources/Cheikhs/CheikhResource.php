<?php

namespace App\Filament\Resources\Cheikhs;

use App\Filament\Resources\Cheikhs\Pages\CreateCheikh;
use App\Filament\Resources\Cheikhs\Pages\EditCheikh;
use App\Filament\Resources\Cheikhs\Pages\ListCheikhs;
use App\Filament\Resources\Cheikhs\Pages\ViewCheikh;
use App\Filament\Resources\Cheikhs\Schemas\CheikhForm;
use App\Filament\Resources\Cheikhs\Schemas\CheikhInfolist;
use App\Filament\Resources\Cheikhs\Tables\CheikhsTable;
use App\Models\Cheikh;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CheikhResource extends Resource
{
    protected static ?string $model = Cheikh::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'Cheikh';

    public static function form(Schema $schema): Schema
    {
        return CheikhForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return CheikhInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CheikhsTable::configure($table);
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
            'index' => ListCheikhs::route('/'),
            'create' => CreateCheikh::route('/create'),
            'view' => ViewCheikh::route('/{record}'),
            'edit' => EditCheikh::route('/{record}/edit'),
        ];
    }
}

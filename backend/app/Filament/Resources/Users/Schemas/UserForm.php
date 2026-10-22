<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Models\Cheikh;
use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('prenom')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('telephone')
                    ->tel()
                    ->default(null),
                Select::make('role')
                    ->options(User::ROLE_OPTIONS)
                    ->default(User::ROLE_STUDENT)
                    ->afterStateUpdated(function (Set $set, ?string $state): void {
                        if ($state !== User::ROLE_ASSISTANT) {
                            $set('assistant_cheikh_id', null);
                        }
                        $set('status', $state === User::ROLE_STUDENT ? 'active' : 'pending');
                    })
                    ->required(),
                Select::make('assistant_cheikh_id')
                    ->label('Cheikh référent')
                    ->options(fn () => Cheikh::with('user')
                        ->get()
                        ->mapWithKeys(fn (Cheikh $cheikh) => [
                            $cheikh->id => trim("{$cheikh->user->prenom} {$cheikh->user->name}"),
                        ]))
                    ->searchable()
                    ->visible(fn (Get $get): bool => $get('role') === User::ROLE_ASSISTANT)
                    ->required(fn (Get $get): bool => $get('role') === User::ROLE_ASSISTANT)
                    ->placeholder('Sélectionnez le cheikh accompagné'),
                Select::make('status')
                    ->options([
                        'pending' => 'En attente',
                        'active' => 'Actif',
                        'rejected' => 'Refusé',
                        'suspended' => 'Suspendu',
                    ])
                    ->default(fn (Get $get): string => $get('role') === User::ROLE_STUDENT ? 'active' : 'pending')
                    ->required(),
                DateTimePicker::make('email_verified_at'),
                TextInput::make('password')
                    ->password()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state): bool => filled($state)),
            ]);
    }
}
